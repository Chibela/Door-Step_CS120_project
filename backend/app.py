#!/usr/bin/env python3
"""
ServeDash Management System - Backend API
Flask REST API with CSV database
"""

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import csv
import os
import json
from datetime import datetime, timedelta
from functools import wraps
from collections import Counter

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS configuration - allow all localhost variations
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3000/", "http://127.0.0.1:3000/"], 
     supports_credentials=True, 
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     expose_headers=['Content-Type'])

# File paths
DATA_DIR = "data"
USERS_CSV = os.path.join(DATA_DIR, "users.csv")
USER_HEADERS = ['email', 'password', 'first_name', 'last_name', 'mobile', 'address', 'dob', 'sex', 'registration_date', 'role']
ORDERS_CSV = os.path.join(DATA_DIR, "orders.csv")
ORDER_HEADERS = ['order_id', 'email', 'items', 'subtotal', 'tax', 'tip', 'total', 'status', 'created_at']
SCHEDULES_CSV = os.path.join(DATA_DIR, "schedules.csv")
SCHEDULE_HEADERS = ['appointment_id', 'manager_email', 'staff_email', 'staff_name', 'date', 'time_slot', 'status', 'notes', 'created_at']

# Menu items - loaded from cached API data
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


def ensure_csv_files():
    """Initialize CSV files if they don't exist"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Users CSV
    if not os.path.exists(USERS_CSV):
        with open(USERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(USER_HEADERS)
            # Demo accounts
            writer.writerow(['admin@foodtruck.com', generate_password_hash('admin123'), 'Admin', 'User', '555-0000', 'Admin St', '1990-01-01', 'M', datetime.now().isoformat(), 'admin'])
            writer.writerow(['staff1@foodtruck.com', generate_password_hash('staff123'), 'Staff', 'One', '555-0001', 'Staff St', '1992-01-01', 'F', datetime.now().isoformat(), 'staff'])
            writer.writerow(['customer@foodtruck.com', generate_password_hash('customer123'), 'Customer', 'User', '555-0002', 'Customer St', '1995-01-01', 'M', datetime.now().isoformat(), 'customer'])
    
    # Orders CSV
    if not os.path.exists(ORDERS_CSV):
        with open(ORDERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(ORDER_HEADERS)
    
    # Schedules CSV (with upgrade if columns changed)
    if not os.path.exists(SCHEDULES_CSV):
        with open(SCHEDULES_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(SCHEDULE_HEADERS)
    else:
        with open(SCHEDULES_CSV, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            existing_headers = next(reader, [])
        if 'staff_email' not in existing_headers or 'notes' not in existing_headers:
            schedules = []
            with open(SCHEDULES_CSV, 'r', newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    schedules.append({
                        'appointment_id': row.get('appointment_id', ''),
                        'manager_email': row.get('manager_email', ''),
                        'staff_email': row.get('staff_email', ''),
                        'staff_name': row.get('staff_name', ''),
                        'date': row.get('date', ''),
                        'time_slot': row.get('time_slot', ''),
                        'status': row.get('status', ''),
                        'notes': row.get('notes', ''),
                        'created_at': row.get('created_at', '')
                    })
            with open(SCHEDULES_CSV, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=SCHEDULE_HEADERS)
                writer.writeheader()
                for schedule in schedules:
                    writer.writerow(schedule)


def read_users():
    """Read users from CSV"""
    users = []
    if os.path.exists(USERS_CSV):
        with open(USERS_CSV, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                users.append(dict(row))
    return users


def read_orders():
    """Read orders from CSV"""
    orders = []
    if os.path.exists(ORDERS_CSV):
        with open(ORDERS_CSV, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                orders.append(dict(row))
    return orders


def read_schedules():
    """Read schedules from CSV"""
    schedules = []
    if os.path.exists(SCHEDULES_CSV):
        with open(SCHEDULES_CSV, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                schedule = {
                    'appointment_id': row.get('appointment_id', ''),
                    'manager_email': row.get('manager_email', ''),
                    'staff_email': row.get('staff_email', ''),
                    'staff_name': row.get('staff_name', ''),
                    'date': row.get('date', ''),
                    'time_slot': row.get('time_slot', ''),
                    'status': row.get('status', ''),
                    'notes': row.get('notes', ''),
                    'created_at': row.get('created_at', '')
                }
                schedules.append(schedule)
    return schedules


def write_schedules(schedules):
    """Persist schedules to CSV"""
    with open(SCHEDULES_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=SCHEDULE_HEADERS)
        writer.writeheader()
        for schedule in schedules:
            writer.writerow(schedule)


def write_orders(orders):
    """Persist orders to CSV"""
    with open(ORDERS_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=ORDER_HEADERS)
        writer.writeheader()
        for order in orders:
            writer.writerow(order)


def write_users(users):
    """Persist users to CSV"""
    with open(USERS_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(USER_HEADERS)
        for user in users:
            writer.writerow([
                user.get('email', ''),
                user.get('password', ''),
                user.get('first_name', ''),
                user.get('last_name', ''),
                user.get('mobile', ''),
                user.get('address', ''),
                user.get('dob', ''),
                user.get('sex', ''),
                user.get('registration_date', ''),
                user.get('role', '')
            ])


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
        'role': user.get('role', '')
    }


def get_user_by_email(email):
    """Fetch single user by email"""
    if not email:
        return None
    email = email.lower()
    for user in read_users():
        if user.get('email', '').lower() == email:
            return user
    return None


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
    """Update user fields in CSV"""
    users = read_users()
    updated = False
    for user in users:
        if user.get('email', '').lower() == email.lower():
            for key, value in updates.items():
                if value is None:
                    continue
                if key == 'password':
                    user['password'] = generate_password_hash(value)
                elif key in user:
                    user[key] = value
            updated = True
            break
    if updated:
        write_users(users)
    return updated


def update_order_record(order_id, updates):
    """Update order fields in CSV"""
    orders = read_orders()
    updated_order = None
    for order in orders:
        if order.get('order_id') == order_id:
            for key, value in updates.items():
                if value is None or key not in order:
                    continue
                order[key] = value
            updated_order = order
            break
    if updated_order:
        write_orders(orders)
    return updated_order


def save_user(email, password, first_name, last_name, mobile, address, dob, sex, role='customer'):
    """Save new user to CSV"""
    with open(USERS_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([email, generate_password_hash(password), first_name, last_name, mobile, address, dob, sex, datetime.now().isoformat(), role])


def save_order(email, items, subtotal, tax, tip, total):
    """Save order to CSV"""
    order_id = f"ORD{int(datetime.now().timestamp() * 1000)}"
    with open(ORDERS_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([order_id, email, json.dumps(items), subtotal, tax, tip, total, 'pending', datetime.now().isoformat()])
    return order_id


def save_appointment(manager_email, staff_email, staff_name, date, time_slot, status='scheduled', notes=''):
    """Save appointment to CSV"""
    appointment_id = f"APT{int(datetime.now().timestamp() * 1000)}"
    with open(SCHEDULES_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([appointment_id, manager_email, staff_email, staff_name, date, time_slot, status, notes, datetime.now().isoformat()])
    return appointment_id


def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


def role_required(*roles):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Unauthorized'}), 401
            user_role = session.get('role')
            if user_role not in roles:
                return jsonify({'error': 'Forbidden'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# Initialize CSV files on startup
ensure_csv_files()


# ==================== AUTHENTICATION ====================

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    data = request.json
    if not data:
        return jsonify({'success': False, 'error': 'Invalid request'}), 400
        
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400
    
    users = read_users()
    for user in users:
        if user['email'].lower() == email and check_password_hash(user['password'], password):
            session['user_id'] = user['email']
            session['role'] = user['role']
            return jsonify({
                'success': True,
                'user': {
                    'email': user['email'],
                    'role': user['role'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name']
                }
            })
    
    return jsonify({'success': False, 'error': 'Invalid email or password'}), 401


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup"""
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    mobile = data.get('mobile', '').strip()
    address = data.get('address', '').strip()
    dob = data.get('dob', '')
    sex = data.get('sex', '')
    
    # Validate
    if not all([email, password, first_name, last_name, mobile, address, dob, sex]):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400
    
    # Check if user exists
    users = read_users()
    if any(u['email'].lower() == email for u in users):
        return jsonify({'success': False, 'error': 'Email already exists'}), 400
    
    # Save user
    save_user(email, password, first_name, last_name, mobile, address, dob, sex, 'customer')
    
    # Auto login
    session['user_id'] = email
    session['role'] = 'customer'
    
    return jsonify({
        'success': True,
        'user': {
            'email': email,
            'role': 'customer',
            'first_name': first_name,
            'last_name': last_name
        }
    })


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout"""
    session.clear()
    return jsonify({'success': True})


@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged in user"""
    users = read_users()
    email = session.get('user_id')
    for user in users:
        if user['email'] == email:
            return jsonify({
                'email': user['email'],
                'role': user['role'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'mobile': user['mobile'],
                'address': user['address'],
                'dob': user['dob'],
                'sex': user['sex']
            })
    return jsonify({'error': 'User not found'}), 404


# ==================== MENU ====================

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get menu items"""
    # Reload menu from cache on each request (in case it was updated)
    global MENU
    MENU = load_menu_from_cache()
    return jsonify(MENU)


# ==================== ORDERS ====================

@app.route('/api/orders', methods=['GET'])
@login_required
def get_orders():
    """Get user orders"""
    email = session.get('user_id')
    role = session.get('role')
    orders = read_orders()
    
    if role == 'admin':
        # Admin sees all orders
        return jsonify(orders)
    else:
        # Customer sees only their orders
        user_orders = [o for o in orders if o['email'] == email]
        return jsonify(user_orders)


@app.route('/api/orders', methods=['POST'])
@login_required
@role_required('customer', 'admin')
def create_order():
    """Create new order"""
    data = request.json
    email = session.get('user_id')
    items = data.get('items', [])
    subtotal = data.get('subtotal', 0)
    tax = data.get('tax', 0)
    tip = data.get('tip', 0)
    total = data.get('total', 0)
    
    order_id = save_order(email, items, subtotal, tax, tip, total)
    
    return jsonify({
        'success': True,
        'order_id': order_id
    })


@app.route('/api/orders/<order_id>', methods=['PUT'])
@login_required
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
    email = session.get('user_id')
    role = session.get('role')
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
@login_required
@role_required('admin')
def create_appointment():
    """Create new appointment (admin only)"""
    data = request.json or {}
    manager_email = session.get('user_id')
    staff_email = (data.get('staff_email') or '').strip().lower()
    date = data.get('date', '').strip()
    time_slot = data.get('time_slot', '').strip()
    notes = data.get('notes', '').strip()
    
    if not all([staff_email, date, time_slot]):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400
    
    staff_user = get_user_by_email(staff_email)
    if not staff_user or staff_user.get('role') != 'staff':
        return jsonify({'success': False, 'error': 'Staff member not found'}), 404
    
    staff_name = f"{staff_user.get('first_name', '').strip()} {staff_user.get('last_name', '').strip()}".strip() or staff_user.get('email')
    
    schedules = read_schedules()
    for s in schedules:
        if s.get('staff_email', '').lower() == staff_email and s.get('date') == date and s.get('time_slot') == time_slot:
            return jsonify({'success': False, 'error': 'Time slot already booked'}), 400
    
    appointment_id = save_appointment(manager_email, staff_email, staff_name, date, time_slot, status='scheduled', notes=notes)
    
    return jsonify({
        'success': True,
        'appointment_id': appointment_id
    })


@app.route('/api/schedules/<appointment_id>', methods=['PUT'])
@login_required
def update_schedule(appointment_id):
    """Update appointment details or status"""
    data = request.json or {}
    role = session.get('role')
    user_email = session.get('user_id', '').lower()
    
    schedules = read_schedules()
    updated_schedule = None
    
    for schedule in schedules:
        if schedule.get('appointment_id') == appointment_id:
            if role == 'staff' and schedule.get('staff_email', '').lower() != user_email:
                return jsonify({'error': 'Forbidden'}), 403
            
            if role == 'admin':
                new_staff_email = data.get('staff_email')
                if new_staff_email:
                    staff_user = get_user_by_email(new_staff_email)
                    if not staff_user or staff_user.get('role') != 'staff':
                        return jsonify({'error': 'Staff member not found'}), 404
                    schedule['staff_email'] = staff_user.get('email').lower()
                    schedule['staff_name'] = f"{staff_user.get('first_name', '').strip()} {staff_user.get('last_name', '').strip()}".strip() or staff_user.get('email')
                if data.get('date'):
                    schedule['date'] = data['date']
                if data.get('time_slot'):
                    schedule['time_slot'] = data['time_slot']
            
            if data.get('status'):
                schedule['status'] = data['status']
            if data.get('notes') is not None:
                schedule['notes'] = data.get('notes', '')
            
            updated_schedule = schedule
            break
    
    if not updated_schedule:
        return jsonify({'error': 'Appointment not found'}), 404
    
    write_schedules(schedules)
    return jsonify({'success': True, 'schedule': updated_schedule})


# ==================== ADMIN DASHBOARD ====================

@app.route('/api/admin/dashboard', methods=['GET'])
@login_required
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
@login_required
@role_required('admin')
def list_staff():
    """Admin: list staff members"""
    staff_users = [sanitize_user(u) for u in read_users() if u.get('role') == 'staff']
    return jsonify(staff_users)


@app.route('/api/staff', methods=['POST'])
@login_required
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
        role='staff'
    )
    
    user = get_user_by_email(email)
    return jsonify({'success': True, 'user': sanitize_user(user)}), 201


@app.route('/api/staff/<path:email>', methods=['PUT'])
@login_required
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
        'password': data.get('password')
    }
    success = update_user_record(email, updates)
    if not success:
        return jsonify({'error': 'Staff member not found'}), 404
    user = get_user_by_email(email)
    return jsonify({'success': True, 'user': sanitize_user(user)})


@app.route('/api/staff/profile', methods=['GET', 'PUT'])
@login_required
@role_required('staff')
def staff_profile():
    """Staff: view or update own profile"""
    email = session.get('user_id')
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
        'password': data.get('password')
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


if __name__ == '__main__':
    app.run(debug=True, port=5000)

