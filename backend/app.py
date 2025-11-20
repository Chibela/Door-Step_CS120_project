#!/usr/bin/env python3
"""
ServeDash Management System - Backend API
Flask REST API with PostgreSQL database
"""

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from collections import Counter
from functools import wraps
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import stripe

load_dotenv(".env.local")
load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")

# Initialize Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
conn.autocommit = True

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_DEFAULT_CURRENCY = os.getenv("STRIPE_DEFAULT_CURRENCY", "usd")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
else:
    stripe.api_key = None


def ensure_users_optional_columns():
    columns = {
        'allergies': "ALTER TABLE users ADD COLUMN allergies TEXT DEFAULT ''",
        'availability': "ALTER TABLE users ADD COLUMN availability TEXT DEFAULT ''",
    }
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'users'
                """
            )
            existing = {row['column_name'] for row in cur.fetchall()}
        for column, statement in columns.items():
            if column not in existing:
                with conn.cursor() as cur:
                    cur.execute(statement)
    except Exception as e:
        print(f"Warning: unable to ensure users optional columns: {e}")


ensure_users_optional_columns()


def ensure_schedules_columns():
    columns = {
        'start_time': "ALTER TABLE schedules ADD COLUMN start_time TEXT",
        'end_time': "ALTER TABLE schedules ADD COLUMN end_time TEXT",
        'location': "ALTER TABLE schedules ADD COLUMN location TEXT",
        'shift_type': "ALTER TABLE schedules ADD COLUMN shift_type TEXT",
        'staff_notes': "ALTER TABLE schedules ADD COLUMN staff_notes TEXT",
        'priority': "ALTER TABLE schedules ADD COLUMN priority TEXT",
    }
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'schedules'
                """
            )
            existing = {row['column_name'] for row in cur.fetchall()}
        for column, statement in columns.items():
            if column not in existing:
                with conn.cursor() as cur:
                    cur.execute(statement)
    except Exception as e:
        print(f"Warning: unable to ensure schedules columns: {e}")


ensure_schedules_columns()


def ensure_orders_payment_columns():
    columns = {
        'payment_intent_id': "ALTER TABLE orders ADD COLUMN payment_intent_id TEXT",
        'payment_status': "ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'",
        'currency': "ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'usd'"
    }
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'orders'
                """
            )
            existing = {row['column_name'] for row in cur.fetchall()}
        for column, statement in columns.items():
            if column not in existing:
                with conn.cursor() as cur:
                    cur.execute(statement)
    except Exception as e:
        print(f"Warning: unable to ensure orders payment columns: {e}")


ensure_orders_payment_columns()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-me")

session_cookie_samesite = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
session_cookie_secure = os.getenv("SESSION_COOKIE_SECURE", "False").lower() == "true"

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE=session_cookie_samesite,
    SESSION_COOKIE_SECURE=session_cookie_secure
)

# CORS configuration - allow localhost plus configured origins
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3000/",
    "http://127.0.0.1:3000/",
    "http://127.0.0.1:5000/",
]
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    default_origins.extend([origin.strip() for origin in extra_origins.split(",") if origin.strip()])

CORS(app,
     origins=default_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Content-Type'])

DATA_DIR = "data"
MENU_CACHE_FILE = os.path.join(DATA_DIR, "menu_cache.json")

def load_menu_from_cache():
    """Load menu items from cached API data"""
    if os.path.exists(MENU_CACHE_FILE):
        try:
            with open(MENU_CACHE_FILE, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
                return cache_data.get('items', [])
        except Exception as e:
            print(f"Error loading menu cache: {e}")
    
    # Fallback to default menu if cache doesn't exist
    return [
        {"id": "1", "name": "Classic Cheeseburger", "description": "Juicy beef patty with cheese, lettuce, tomato, and special sauce", "price": 8.99, "category": "burgers", "image": ""},
        {"id": "2", "name": "BBQ Pulled Pork Sandwich", "description": "Slow-cooked pork with tangy BBQ sauce and coleslaw", "price": 9.99, "category": "sandwiches", "image": ""},
        {"id": "3", "name": "Fish Tacos (3pc)", "description": "Fresh fish with cabbage slaw, lime crema, and cilantro", "price": 11.99, "category": "tacos", "image": ""},
        {"id": "4", "name": "Loaded Nachos", "description": "Crispy tortilla chips with cheese, jalapeños, sour cream, and guacamole", "price": 7.99, "category": "appetizers", "image": ""},
        {"id": "5", "name": "Chicken Wings (8pc)", "description": "Crispy wings with your choice of Buffalo, BBQ, or Honey Garlic", "price": 10.99, "category": "appetizers", "image": ""},
    ]

MENU = load_menu_from_cache()

TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

MONEY_QUANTIZER = Decimal('0.01')


def to_decimal(value, default=Decimal('0.00')):
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default


def quantize_money(amount):
    return amount.quantize(MONEY_QUANTIZER)


def dollars_to_cents(amount):
    if amount is None:
        return None
    return int((amount * Decimal('100')).to_integral_value())


def calculate_subtotal_from_items(items):
    """Calculate subtotal using server-side pricing as best effort."""
    global MENU
    if not MENU:
        MENU = load_menu_from_cache()
    price_map = {str(item.get('id')): to_decimal(item.get('price'), Decimal('0')) for item in MENU}
    subtotal = Decimal('0')
    for entry in items:
        item_id = str(entry.get('id'))
        quantity = to_decimal(entry.get('quantity'), Decimal('0'))
        if quantity <= 0:
            continue
        price = price_map.get(item_id)
        if price is None or price == Decimal('0'):
            price = to_decimal(entry.get('price'), Decimal('0'))
        subtotal += price * quantity
    return quantize_money(subtotal)


def compute_order_totals(items, tax_value, tip_value):
    subtotal = calculate_subtotal_from_items(items)
    tax_dec = quantize_money(to_decimal(tax_value, Decimal('0')))
    tip_dec = quantize_money(to_decimal(tip_value, Decimal('0')))
    total = quantize_money(subtotal + tax_dec + tip_dec)
    return subtotal, tax_dec, tip_dec, total


ALLERGEN_KEYWORDS = {
    'dairy': ['dairy', 'milk', 'cheese', 'butter', 'cream', 'yogurt'],
    'nuts': ['nut', 'nuts', 'peanut', 'peanuts', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio'],
    'gluten': ['gluten', 'wheat', 'barley', 'rye', 'bread', 'bun', 'pasta', 'flour'],
    'shellfish': ['shellfish', 'shrimp', 'lobster', 'crab', 'clam', 'mussel', 'oyster', 'scallop'],
    'soy': ['soy', 'soybean', 'tofu', 'edamame'],
    'egg': ['egg', 'eggs'],
    'fish': ['fish', 'salmon', 'tuna', 'cod', 'trout', 'anchovy', 'tilapia'],
    'sesame': ['sesame', 'tahini'],
}

DEFAULT_SHIFT_TYPES = [
    'Prep Shift',
    'Lunch Service',
    'Dinner Service',
    'Event / Catering',
    'Inventory & Restock',
]


def read_users():
    with conn.cursor() as cur:
        cur.execute(
            "SELECT email, password, first_name, last_name, mobile, address, dob, sex, registration_date, role, allergies, availability FROM users"
        )
        rows = cur.fetchall()
    return [dict(row) for row in rows]


def read_orders():
    with conn.cursor() as cur:
        cur.execute(
            "SELECT order_id, email, items, subtotal, tax, tip, total, status, created_at, payment_intent_id, payment_status, currency FROM orders"
        )
        rows = cur.fetchall()
    return [dict(row) for row in rows]


def read_schedules():
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT appointment_id, manager_email, staff_email, staff_name, date, time_slot,
                   status, notes, created_at, start_time, end_time, location, shift_type,
                   staff_notes, priority
            FROM schedules
            """
        )
        rows = cur.fetchall()
    return [dict(row) for row in rows]


def sanitize_user(user):
    """Return user dict without sensitive fields"""
    return {
        'email': user.get('email', ''),
        'first_name': user.get('first_name', ''),
        'last_name': user.get('last_name', ''),
        'mobile': user.get('mobile', ''),
        'address': user.get('address', ''),
        'dob': user.get('dob', ''),
        'sex': user.get('sex', ''),
        'role': user.get('role', ''),
        'allergies': user.get('allergies', ''),
        'availability': user.get('availability', '')
    }


def get_user_by_email(email):
    if not email:
        return None
    email = email.lower()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT email, password, first_name, last_name, mobile, address, dob, sex,
                   registration_date, role, allergies, availability
            FROM users
            WHERE LOWER(email) = %s
            """,
            (email,),
        )
        row = cur.fetchone()
    if not row:
        return None
    return dict(row)


def get_session_user():
    """Return the current logged-in user record based on session."""
    email = session.get('user_id')
    if not email:
        return None
    return get_user_by_email(email)


def parse_datetime(value):
    """Safely parse ISO datetime strings"""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        try:
            return datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return None


def update_user_record(email, updates):
    if not email:
        return False
    email = email.lower()
    set_clauses = []
    params = []
    for key, value in updates.items():
        if value is None:
            continue
        if key == 'password':
            set_clauses.append("password = %s")
            params.append(generate_password_hash(value))
        else:
            set_clauses.append(f"{key} = %s")
            params.append(value)
    if not set_clauses:
        return False
    params.append(email)
    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE LOWER(email) = %s"
    with conn.cursor() as cur:
        cur.execute(query, tuple(params))
        return cur.rowcount > 0


def update_order_record(order_id, updates):
    if not order_id:
        return None
    update_doc = {k: v for k, v in updates.items() if v is not None}
    if not update_doc:
        return None
    set_clauses = []
    params = []
    for key, value in update_doc.items():
        set_clauses.append(f"{key} = %s")
        params.append(value)
    params.append(order_id)
    query = (
        "UPDATE orders SET {fields} WHERE order_id = %s RETURNING "
        "order_id, email, items, subtotal, tax, tip, total, status, created_at, "
        "payment_intent_id, payment_status, currency"
    ).format(fields=', '.join(set_clauses))
    with conn.cursor() as cur:
        cur.execute(query, tuple(params))
        row = cur.fetchone()
    if not row:
        return None
    return dict(row)


def save_user(email, password, first_name, last_name, mobile, address, dob, sex, role='customer', allergies='', availability=''):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO users (email, password, first_name, last_name, mobile, address, dob, sex, registration_date, role, allergies, availability) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                email.lower(),
                generate_password_hash(password),
                first_name,
                last_name,
                mobile,
                address,
                dob,
                sex,
                datetime.now().isoformat(),
                role,
                allergies,
                availability,
            ),
        )


def save_order(email, items, subtotal, tax, tip, total, status='pending', payment_intent_id=None, payment_status='pending', currency='usd'):
    order_id = f"ORD{int(datetime.now().timestamp() * 1000)}"
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO orders
            (order_id, email, items, subtotal, tax, tip, total, status, created_at, payment_intent_id, payment_status, currency)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                order_id,
                email,
                json.dumps(items),
                subtotal,
                tax,
                tip,
                total,
                status,
                datetime.now().isoformat(),
                payment_intent_id,
                payment_status,
                currency,
            ),
        )
    return order_id


def save_appointment(manager_email, staff_email, staff_name, date, time_slot, status='scheduled', notes='', start_time=None, end_time=None, location='', shift_type='', priority='normal'):
    appointment_id = f"APT{int(datetime.now().timestamp() * 1000)}"
    iso_start = start_time or parse_time_string(date, time_slot)
    if not end_time and iso_start:
        default_end = datetime.fromisoformat(iso_start) + timedelta(hours=2)
        iso_end = default_end.isoformat()
    else:
        iso_end = end_time
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO schedules (appointment_id, manager_email, staff_email, staff_name, date, time_slot, status, notes, created_at, start_time, end_time, location, shift_type, staff_notes, priority) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                appointment_id,
                manager_email,
                staff_email,
                staff_name,
                date,
                time_slot,
                status,
                notes,
                datetime.now().isoformat(),
                iso_start,
                iso_end,
                location,
                shift_type,
                '',
                priority or 'normal'
            ),
        )
    return appointment_id


def parse_allergies(raw):
    if not raw:
        return []
    if isinstance(raw, list):
        values = raw
    else:
        values = [part.strip() for part in str(raw).replace(';', ',').split(',')]
    return [value.lower() for value in values if value]


def allergy_search_terms(allergy):
    allergy = allergy.lower()
    for base, keywords in ALLERGEN_KEYWORDS.items():
        if allergy == base or allergy in keywords:
            return list(set(keywords + [base]))
    return [allergy]


def detect_allergy_conflicts(items, allergies):
    conflicts = []
    if not items or not allergies:
        return conflicts

    for item in items:
        text = f"{item.get('name', '')} {item.get('description', '')}".lower()
        item_conflicts = set()
        for allergy in allergies:
            for term in allergy_search_terms(allergy):
                if term and term in text:
                    item_conflicts.add(allergy)
        if item_conflicts:
            conflicts.append({
                'item': item.get('name', 'Menu item'),
                'allergies': sorted(item_conflicts)
            })
    return conflicts


def parse_time_string(date_str, time_value):
    """Convert various time inputs into ISO string."""
    if not date_str:
        return None
    if not time_value:
        return None
    try:
        # If already ISO-like
        if 'T' in time_value:
            return time_value
        time_value = time_value.strip()
        if ' ' in time_value:
            time_part, meridiem = time_value.split()
            hour_str, minute_str = time_part.split(':')
            hours = int(hour_str)
            minutes = int(minute_str)
            meridiem = meridiem.upper()
            if meridiem == 'PM' and hours != 12:
                hours += 12
            if meridiem == 'AM' and hours == 12:
                hours = 0
        else:
            hour_str, minute_str = time_value.split(':')
            hours = int(hour_str)
            minutes = int(minute_str)
        return f"{date_str}T{str(hours).zfill(2)}:{str(minutes).zfill(2)}:00"
    except Exception:
        return None


def overlap(a_start, a_end, b_start, b_end):
    if not a_start or not a_end or not b_start or not b_end:
        return False
    try:
        a_start_dt = datetime.fromisoformat(a_start)
        a_end_dt = datetime.fromisoformat(a_end)
        b_start_dt = datetime.fromisoformat(b_start)
        b_end_dt = datetime.fromisoformat(b_end)
        return max(a_start_dt, b_start_dt) < min(a_end_dt, b_end_dt)
    except Exception:
        return False


def check_schedule_conflicts(staff_email, start_time, end_time, appointment_id=None):
    requested_start = start_time
    requested_end = end_time
    if not requested_end and requested_start:
        try:
            requested_end = (datetime.fromisoformat(requested_start) + timedelta(hours=2)).isoformat()
        except Exception:
            requested_end = None
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT appointment_id, start_time, end_time, date, time_slot
            FROM schedules
            WHERE LOWER(staff_email) = %s
            """,
            (staff_email.lower(),)
        )
        rows = cur.fetchall()
    conflicts = []
    for row in rows:
        if appointment_id and row['appointment_id'] == appointment_id:
            continue
        existing_start = row.get('start_time') or parse_time_string(row.get('date'), row.get('time_slot'))
        existing_end = row.get('end_time')
        if not existing_end and existing_start:
            try:
                existing_end = (datetime.fromisoformat(existing_start) + timedelta(hours=2)).isoformat()
            except Exception:
                existing_end = None
        if overlap(requested_start, requested_end, existing_start, existing_end):
            conflicts.append({
                'appointment_id': row['appointment_id'],
                'date': row.get('date'),
                'time_slot': row.get('time_slot'),
                'start_time': existing_start,
                'end_time': existing_end
            })
    return conflicts


def login_required(f):
    """Decorator to ensure a user is authenticated via session."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)

    return decorated


def role_required(*roles):
    """Decorator to ensure the current session has one of the allowed roles."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Unauthorized'}), 401
            if session.get('role') not in roles:
                return jsonify({'error': 'Forbidden'}), 403
            return f(*args, **kwargs)

        return decorated

    return decorator


# ==================== AUTHENTICATION (Flask Session) ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login with email/password stored in Postgres."""
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    user = get_user_by_email(email)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

    session['user_id'] = user['email']
    session['role'] = user['role']

    return jsonify({'success': True, 'user': sanitize_user(user)})


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Customer signup."""
    data = request.json or {}
    required_fields = ['email', 'password', 'first_name', 'last_name', 'mobile', 'address', 'dob', 'sex']
    if not all((data.get(field) or '').strip() for field in required_fields):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    email = data['email'].strip().lower()
    if get_user_by_email(email):
        return jsonify({'success': False, 'error': 'Email already exists'}), 400

    save_user(
        email,
        data['password'],
        data['first_name'].strip(),
        data['last_name'].strip(),
        data['mobile'].strip(),
        data['address'].strip(),
        data['dob'].strip(),
        data['sex'].strip(),
        role='customer',
        allergies=data.get('allergies', '').strip(),
        availability=data.get('availability', '').strip()
    )

    session['user_id'] = email
    session['role'] = 'customer'

    return jsonify({'success': True, 'user': sanitize_user(get_user_by_email(email))})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Clear the current session."""
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Return the currently authenticated user."""
    user = get_session_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(sanitize_user(user))


@app.route('/api/customer/profile', methods=['GET', 'PUT'])
@login_required
def customer_profile():
    """Customer self-service profile"""
    role = session.get('role')
    if role not in ('customer', 'admin'):
        return jsonify({'error': 'Forbidden'}), 403

    email = session.get('user_id')
    user = get_user_by_email(email)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if request.method == 'GET':
        return jsonify(sanitize_user(user))

    data = request.json or {}
    updates = {
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'mobile': data.get('mobile'),
        'address': data.get('address'),
        'dob': data.get('dob'),
        'sex': data.get('sex'),
        'password': data.get('password'),
        'allergies': data.get('allergies'),
        'availability': data.get('availability'),
    }
    success = update_user_record(email, updates)
    if not success:
        return jsonify({'error': 'Unable to update profile'}), 400
    return jsonify({'success': True, 'user': sanitize_user(get_user_by_email(email))})


# ==================== MENU ====================

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get menu items"""
    # Reload menu from cache on each request (in case it was updated)
    global MENU
    MENU = load_menu_from_cache()
    return jsonify(MENU)


# ==================== ORDERS ====================

@app.route('/api/payments/config', methods=['GET'])
@login_required
def payment_config():
    """Expose publishable key to frontend if Stripe is configured."""
    if not STRIPE_PUBLISHABLE_KEY:
        return jsonify({'enabled': False})
    return jsonify({
        'enabled': True,
        'publishableKey': STRIPE_PUBLISHABLE_KEY,
        'currency': STRIPE_DEFAULT_CURRENCY
    })


@app.route('/api/payments/create-intent', methods=['POST'])
@role_required('customer', 'admin')
def create_payment_intent():
    if not STRIPE_SECRET_KEY:
        return jsonify({'error': 'Card payments are not available right now.'}), 503

    data = request.json or {}
    items = data.get('items', [])
    tip_value = data.get('tip', 0)
    tax_value = data.get('tax', 0)

    if not items:
        return jsonify({'error': 'Cart is empty'}), 400

    subtotal_dec, tax_dec, tip_dec, total_dec = compute_order_totals(items, tax_value, tip_value)
    amount_cents = dollars_to_cents(total_dec)
    if amount_cents is None or amount_cents <= 0:
        return jsonify({'error': 'Invalid total amount'}), 400

    user = get_session_user() or {}
    metadata = {
        'customer_email': user.get('email', ''),
        'subtotal': str(subtotal_dec),
        'tax': str(tax_dec),
        'tip': str(tip_dec)
    }
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=STRIPE_DEFAULT_CURRENCY,
            automatic_payment_methods={'enabled': True},
            metadata=metadata
        )
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400

    return jsonify({
        'clientSecret': intent.get('client_secret'),
        'paymentIntentId': intent.get('id'),
        'amount': str(total_dec),
        'currency': intent.get('currency', STRIPE_DEFAULT_CURRENCY)
    })


@app.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    """Get user orders"""
    user = get_session_user() or {}
    email = user.get('email', '')
    role = user.get('role', '')
    orders = read_orders()
    
    if role == 'admin':
        # Admin sees all orders
        return jsonify(orders)
    else:
        # Customer sees only their orders
        user_orders = [o for o in orders if o['email'] == email]
        return jsonify(user_orders)


@app.route('/api/orders', methods=['POST'])
@role_required('customer', 'admin')
def create_order():
    """Create new order"""
    data = request.json or {}
    user = get_session_user() or {}
    email = user.get('email', '')
    items = data.get('items', [])
    tip_value = data.get('tip', 0)
    tax_value = data.get('tax', 0)
    currency = (data.get('currency') or STRIPE_DEFAULT_CURRENCY).lower()
    payment_intent_id = data.get('payment_intent_id')

    if not items:
        return jsonify({'success': False, 'error': 'Cart is empty'}), 400

    subtotal_dec, tax_dec, tip_dec, total_dec = compute_order_totals(items, tax_value, tip_value)

    payment_status = data.get('payment_status', 'pending')
    require_payment = bool(STRIPE_SECRET_KEY) and user.get('role') == 'customer'

    if payment_intent_id:
        if not STRIPE_SECRET_KEY:
            return jsonify({'success': False, 'error': 'Payments are not enabled on the server'}), 503
        try:
            existing = None
            with conn.cursor() as cur:
                cur.execute("SELECT order_id FROM orders WHERE payment_intent_id = %s", (payment_intent_id,))
                existing = cur.fetchone()
            if existing:
                return jsonify({'success': False, 'error': 'This payment has already been processed.'}), 400

            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            return jsonify({'success': False, 'error': f'Unable to verify payment: {str(e)}'}), 400

        if intent.get('status') != 'succeeded':
            return jsonify({'success': False, 'error': 'Payment has not completed yet.'}), 400

        amount_cents = dollars_to_cents(total_dec) or 0
        if intent.get('amount_received') and int(intent['amount_received']) < amount_cents:
            return jsonify({'success': False, 'error': 'Payment amount does not match order total.'}), 400

        currency = intent.get('currency', currency)
        payment_status = intent.get('status', 'succeeded')
    elif require_payment:
        return jsonify({'success': False, 'error': 'Payment is required before placing an order.'}), 400

    allergies = parse_allergies(user.get('allergies', ''))
    conflicts = detect_allergy_conflicts(items, allergies)
    if conflicts:
        return jsonify({
            'success': False,
            'error': 'Allergy alert: please review your cart before ordering.',
            'conflicts': conflicts
        }), 400
    
    order_id = save_order(
        email,
        items,
        subtotal_dec,
        tax_dec,
        tip_dec,
        total_dec,
        payment_intent_id=payment_intent_id,
        payment_status=payment_status,
        currency=currency
    )
    
    return jsonify({
        'success': True,
        'order_id': order_id
    })


@app.route('/api/orders/<order_id>', methods=['PUT'])
@role_required('admin')
def update_order(order_id):
    """Update order status/details (admin only)"""
    data = request.json or {}
    allowed_fields = {'status'}
    updates = {k: v for k, v in data.items() if k in allowed_fields and v is not None}
    if not updates:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    updated_order = update_order_record(order_id, updates)
    if not updated_order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify({'success': True, 'order': updated_order})


# ==================== SCHEDULES ====================

@app.route('/api/schedules', methods=['GET'])
@login_required
def get_schedules():
    """Get schedules"""
    user = get_session_user() or {}
    email = user.get('email', '')
    role = user.get('role', '')
    schedules = read_schedules()
    
    if role == 'admin':
        # Admin sees all schedules
        return jsonify(schedules)
    elif role == 'staff':
        # Staff sees their own schedule
        # Match by staff email or name
        user_schedules = [s for s in schedules if s.get('staff_email', '').lower() == email.lower()]
        return jsonify(user_schedules)
    else:
        return jsonify([])


@app.route('/api/schedules', methods=['POST'])
@role_required('admin')
def create_appointment():
    """Create new appointment (admin only)"""
    data = request.json or {}
    user = get_session_user() or {}
    manager_email = user.get('email', '')
    staff_email = (data.get('staff_email') or '').strip().lower()
    date = data.get('date', '').strip()
    time_slot = data.get('time_slot', '').strip()
    notes = data.get('notes', '').strip()
    location = (data.get('location') or 'Main Truck').strip()
    shift_type = (data.get('shift_type') or DEFAULT_SHIFT_TYPES[0]).strip()
    priority = (data.get('priority') or 'normal').strip()
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if not all([staff_email, date, time_slot]):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400
    
    staff_user = get_user_by_email(staff_email)
    if not staff_user or staff_user.get('role') != 'staff':
        return jsonify({'success': False, 'error': 'Staff member not found'}), 404
    
    staff_name = f"{staff_user.get('first_name', '').strip()} {staff_user.get('last_name', '').strip()}".strip() or staff_user.get('email')
    
    iso_start = start_time or parse_time_string(date, time_slot)
    iso_end = end_time
    if not iso_end and iso_start:
        iso_end = (datetime.fromisoformat(iso_start) + timedelta(hours=2)).isoformat()

    conflicts = check_schedule_conflicts(staff_email, iso_start, iso_end)
    if conflicts:
        return jsonify({'success': False, 'error': 'Staff already scheduled for that time', 'conflicts': conflicts}), 400
    
    appointment_id = save_appointment(
        manager_email,
        staff_email,
        staff_name,
        date,
        time_slot,
        status='scheduled',
        notes=notes,
        start_time=iso_start,
        end_time=iso_end,
        location=location,
        shift_type=shift_type,
        priority=priority
    )
    
    return jsonify({
        'success': True,
        'appointment_id': appointment_id
    })


@app.route('/api/schedules/request', methods=['POST'])
@role_required('staff')
def request_schedule():
    """Staff: request a new shift"""
    data = request.json or {}
    staff_user = get_session_user() or {}
    staff_email = (staff_user.get('email') or '').strip().lower()
    if not staff_email:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 403

    date = (data.get('date') or '').strip()
    time_slot = (data.get('time_slot') or '').strip()
    notes = (data.get('notes') or '').strip()
    location = (data.get('location') or 'Main Truck').strip()
    shift_type = (data.get('shift_type') or DEFAULT_SHIFT_TYPES[0]).strip()
    priority = (data.get('priority') or 'normal').strip()
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not date or not time_slot:
        return jsonify({'success': False, 'error': 'Date and time are required'}), 400

    staff_name = f"{staff_user.get('first_name', '').strip()} {staff_user.get('last_name', '').strip()}".strip() or staff_user.get('email', '')

    iso_start = start_time or parse_time_string(date, time_slot)
    iso_end = end_time
    if not iso_end and iso_start:
        try:
            iso_end = (datetime.fromisoformat(iso_start) + timedelta(hours=2)).isoformat()
        except Exception:
            iso_end = None

    if iso_start and iso_end:
        conflicts = check_schedule_conflicts(staff_email, iso_start, iso_end)
        if conflicts:
            return jsonify({'success': False, 'error': 'You already have a shift scheduled during that time.', 'conflicts': conflicts}), 400

    appointment_id = save_appointment(
        manager_email=staff_email,
        staff_email=staff_email,
        staff_name=staff_name,
        date=date,
        time_slot=time_slot,
        status='requested',
        notes=notes,
        start_time=iso_start,
        end_time=iso_end,
        location=location,
        shift_type=shift_type,
        priority=priority
    )

    return jsonify({'success': True, 'appointment_id': appointment_id})
# Preview conflicts endpoint
@app.route('/api/schedules/conflicts', methods=['GET'])
@role_required('admin')
def preview_conflicts():
    staff_email = (request.args.get('staff_email') or '').strip().lower()
    date = (request.args.get('date') or '').strip()
    time_slot = (request.args.get('time_slot') or '').strip()
    start_time = request.args.get('start_time')
    end_time = request.args.get('end_time')
    appointment_id = request.args.get('appointment_id')

    if not staff_email:
        return jsonify({'conflicts': []})

    iso_start = start_time or parse_time_string(date, time_slot)
    iso_end = end_time
    if not iso_end and iso_start:
        try:
            iso_end = (datetime.fromisoformat(iso_start) + timedelta(hours=2)).isoformat()
        except Exception:
            iso_end = None

    if not iso_start or not iso_end:
        return jsonify({'conflicts': []})

    conflicts = check_schedule_conflicts(staff_email, iso_start, iso_end, appointment_id=appointment_id)
    return jsonify({'conflicts': conflicts})


def update_schedule_record(appointment_id, updates):
    """Update a schedule record in the database and return the updated row"""
    if not appointment_id:
        return None
    update_doc = {k: v for k, v in updates.items() if v is not None}
    if not update_doc:
        return None
    set_clauses = []
    params = []
    for key, value in update_doc.items():
        set_clauses.append(f"{key} = %s")
        params.append(value)
    params.append(appointment_id)
    query = (
        "UPDATE schedules "
        f"SET {', '.join(set_clauses)} "
        "WHERE appointment_id = %s "
        "RETURNING appointment_id, manager_email, staff_email, staff_name, date, time_slot, status, notes, created_at, "
        "start_time, end_time, location, shift_type, staff_notes, priority"
    )
    with conn.cursor() as cur:
        cur.execute(query, tuple(params))
        row = cur.fetchone()
    if not row:
        return None
    return dict(row)


@app.route('/api/schedules/<appointment_id>', methods=['PUT'])
@login_required
def update_schedule(appointment_id):
    """Update appointment details or status"""
    data = request.json or {}
    user = get_session_user() or {}
    role = user.get('role', '')
    user_email = user.get('email', '').lower()

    # Load current schedule
    schedules = read_schedules()
    current = next((s for s in schedules if s.get('appointment_id') == appointment_id), None)
    if not current:
        return jsonify({'error': 'Appointment not found'}), 404

    # Staff can only modify their own appointments
    if role == 'staff' and current.get('staff_email', '').lower() != user_email:
        return jsonify({'error': 'Forbidden'}), 403

    updates = {}

    # Admin can reassign and change date/time
    new_staff_email = current.get('staff_email', '').lower()

    if role == 'admin':
        if user_email:
            updates['manager_email'] = user_email
        staff_email_override = data.get('staff_email')
        if staff_email_override:
            staff_user = get_user_by_email(staff_email_override)
            if not staff_user or staff_user.get('role') != 'staff':
                return jsonify({'error': 'Staff member not found'}), 404
            new_staff_email = staff_user.get('email').lower()
            updates['staff_email'] = new_staff_email
            updates['staff_name'] = f"{staff_user.get('first_name', '').strip()} {staff_user.get('last_name', '').strip()}".strip() or staff_user.get('email')

        new_date = data.get('date') or current.get('date')
        new_time_slot = data.get('time_slot') or current.get('time_slot')
        new_start_time = data.get('start_time') or current.get('start_time') or parse_time_string(new_date, new_time_slot)
        new_end_time = data.get('end_time') or current.get('end_time')
        if not new_end_time and new_start_time:
            new_end_time = (datetime.fromisoformat(new_start_time) + timedelta(hours=2)).isoformat()

        if data.get('date'):
            updates['date'] = data['date']
        if data.get('time_slot'):
            updates['time_slot'] = data['time_slot']
        if data.get('start_time'):
            updates['start_time'] = new_start_time
        if data.get('end_time'):
            updates['end_time'] = new_end_time

        if data.get('location') is not None:
            updates['location'] = data.get('location')
        if data.get('shift_type') is not None:
            updates['shift_type'] = data.get('shift_type')
        if data.get('priority') is not None:
            updates['priority'] = data.get('priority')

        if new_start_time and new_end_time:
            conflicts = check_schedule_conflicts(new_staff_email, new_start_time, new_end_time, appointment_id=appointment_id)
            if conflicts:
                return jsonify({'error': 'Schedule conflict detected', 'conflicts': conflicts}), 400

    # Both admin and staff can update status and notes
    if data.get('status'):
        updates['status'] = data['status']
    if data.get('notes') is not None:
        updates['notes'] = data.get('notes', '')
    if data.get('staff_notes') is not None:
        updates['staff_notes'] = data.get('staff_notes', '')

    updated_schedule = update_schedule_record(appointment_id, updates)
    if not updated_schedule:
        return jsonify({'error': 'Appointment not found'}), 404

    return jsonify({'success': True, 'schedule': updated_schedule})


# ==================== ADMIN DASHBOARD ====================

@app.route('/api/admin/dashboard', methods=['GET'])
@role_required('admin')
def admin_dashboard():
    """Get admin dashboard stats"""
    orders = read_orders()
    schedules = read_schedules()
    
    total_orders = len(orders)
    total_revenue = sum(float(o.get('total', 0) or 0) for o in orders)
    pending_orders = len([o for o in orders if o.get('status') == 'pending'])
    total_appointments = len(schedules)
    
    # Revenue trend (last 7 days)
    today = datetime.now().date()
    start_date = today - timedelta(days=6)
    revenue_trend = []
    for i in range(7):
        current_day = start_date + timedelta(days=i)
        day_label = current_day.strftime('%b %d')
        day_orders = 0
        day_revenue = 0.0
        for order in orders:
            created_at = parse_datetime(order.get('created_at'))
            if created_at and created_at.date() == current_day:
                day_orders += 1
                day_revenue += float(order.get('total', 0) or 0)
        revenue_trend.append({
            'date': day_label,
            'orders': day_orders,
            'revenue': round(day_revenue, 2)
        })
    
    # Top dishes
    dish_counter = Counter()
    for order in orders:
        items_raw = order.get('items')
        if not items_raw:
            continue
        try:
            items = json.loads(items_raw)
        except (TypeError, json.JSONDecodeError):
            continue
        for item in items:
            name = item.get('name')
            if not name:
                continue
            qty = int(item.get('quantity', 1))
            dish_counter[name] += qty
    top_dishes = [
        {'name': name, 'orders': count}
        for name, count in dish_counter.most_common(5)
    ]
    
    recent_orders = sorted(orders, key=lambda x: x.get('created_at', ''), reverse=True)[:5]
    
    return jsonify({
        'stats': {
            'total_orders': total_orders,
            'total_revenue': round(total_revenue, 2),
            'pending_orders': pending_orders,
            'total_appointments': total_appointments,
            'revenue_trend': revenue_trend
        },
        'recent_orders': recent_orders,
        'top_dishes': top_dishes
    })


# ==================== STAFF ====================

@app.route('/api/staff', methods=['GET'])
@role_required('admin')
def list_staff():
    """Admin: list staff members"""
    staff_users = [sanitize_user(u) for u in read_users() if u.get('role') == 'staff']
    return jsonify(staff_users)


@app.route('/api/staff', methods=['POST'])
@role_required('admin')
def create_staff_user():
    """Admin: create staff account"""
    data = request.json or {}
    required_fields = ['email', 'password', 'first_name', 'last_name']
    if not all(data.get(field) for field in required_fields):
        return jsonify({'error': 'Email, password, first name, and last name are required'}), 400
    
    email = data['email'].lower()
    if get_user_by_email(email):
        return jsonify({'error': 'User already exists'}), 400

    save_user(
        email,
        data['password'],
        data.get('first_name', ''),
        data.get('last_name', ''),
        data.get('mobile', ''),
        data.get('address', ''),
        data.get('dob', ''),
        data.get('sex', ''),
        role='staff',
        allergies=data.get('allergies', '').strip(),
        availability=data.get('availability', '').strip()
    )

    user = get_user_by_email(email)
    return jsonify({'success': True, 'user': sanitize_user(user)}), 201


@app.route('/api/staff/<path:email>', methods=['PUT'])
@role_required('admin')
def update_staff_user(email):
    """Admin: update staff details"""
    data = request.json or {}
    updates = {
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'mobile': data.get('mobile'),
        'address': data.get('address'),
        'dob': data.get('dob'),
        'sex': data.get('sex'),
        'password': data.get('password'),
        'allergies': data.get('allergies'),
        'availability': data.get('availability')
    }
    success = update_user_record(email, updates)
    if not success:
        return jsonify({'error': 'Staff member not found'}), 404
    user = get_user_by_email(email)
    return jsonify({'success': True, 'user': sanitize_user(user)})


@app.route('/api/staff/profile', methods=['GET', 'PUT'])
@role_required('staff')
def staff_profile():
    """Staff: view or update own profile"""
    user = get_session_user() or {}
    email = user.get('email', '')
    if request.method == 'GET':
        user = get_user_by_email(email)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(sanitize_user(user))
    
    data = request.json or {}
    updates = {
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'mobile': data.get('mobile'),
        'address': data.get('address'),
        'dob': data.get('dob'),
        'sex': data.get('sex'),
        'password': data.get('password'),
        'allergies': data.get('allergies'),
        'availability': data.get('availability')
    }
    success = update_user_record(email, updates)
    if not success:
        return jsonify({'error': 'User not found'}), 404
    user = get_user_by_email(email)
    return jsonify({'success': True, 'user': sanitize_user(user)})


@app.route('/api/time-slots', methods=['GET'])
def get_time_slots():
    """Get available time slots"""
    return jsonify(TIME_SLOTS)


# ==================== STRIPE PAYMENT ====================

@app.route('/api/create-payment-intent', methods=['POST'])
@login_required
def create_payment_intent():
    """Create a Stripe PaymentIntent for the order"""
    if not STRIPE_SECRET_KEY:
        return jsonify({'error': 'Stripe is not configured'}), 500
    
    data = request.json or {}
    user = get_session_user() or {}
    email = user.get('email', '')
    items = data.get('items', [])
    subtotal = float(data.get('subtotal', 0))
    tax = float(data.get('tax', 0))
    tip = float(data.get('tip', 0))
    total = float(data.get('total', 0))

    if not items or total <= 0:
        return jsonify({'error': 'Invalid order amount'}), 400

    # Check for allergy conflicts before creating payment intent
    allergies = parse_allergies(user.get('allergies', ''))
    conflicts = detect_allergy_conflicts(items, allergies)
    if conflicts:
        return jsonify({
            'error': 'Allergy alert: please review your cart before ordering.',
            'conflicts': conflicts
        }), 400

    try:
        # Create payment intent (amount in cents)
        intent = stripe.PaymentIntent.create(
            amount=int(round(total * 100)),  # Convert to cents
            currency='usd',
            metadata={
                'email': email,
                'subtotal': str(subtotal),
                'tax': str(tax),
                'tip': str(tip),
            },
            description=f'Order from {email}'
        )
        
        return jsonify({
            'success': True,
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        })
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/confirm-payment', methods=['POST'])
@login_required
def confirm_payment():
    """Confirm payment and create the order"""
    data = request.json or {}
    user = get_session_user() or {}
    email = user.get('email', '')
    
    payment_intent_id = data.get('paymentIntentId')
    items = data.get('items', [])
    subtotal = data.get('subtotal', 0)
    tax = data.get('tax', 0)
    tip = data.get('tip', 0)
    total = data.get('total', 0)

    if not payment_intent_id or not items:
        return jsonify({'error': 'Missing payment or order details'}), 400

    try:
        # Retrieve the payment intent to verify it succeeded
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != 'succeeded':
            return jsonify({'error': f'Payment status: {intent.status}'}), 400
        
        # Create the order in the database
        order_id = save_order(email, items, subtotal, tax, tip, total)
        
        return jsonify({
            'success': True,
            'order_id': order_id,
            'message': 'Order placed successfully!'
        })
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)