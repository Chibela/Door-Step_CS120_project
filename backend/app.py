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
from datetime import datetime
from functools import wraps

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
ORDERS_CSV = os.path.join(DATA_DIR, "orders.csv")
SCHEDULES_CSV = os.path.join(DATA_DIR, "schedules.csv")

# Menu items
MENU = [
    {"id": "1", "name": "Classic Cheeseburger", "description": "Juicy beef patty with cheese, lettuce, tomato, and special sauce", "price": 8.99, "category": "burgers"},
    {"id": "2", "name": "BBQ Pulled Pork Sandwich", "description": "Slow-cooked pork with tangy BBQ sauce and coleslaw", "price": 9.99, "category": "sandwiches"},
    {"id": "3", "name": "Fish Tacos (3pc)", "description": "Fresh fish with cabbage slaw, lime crema, and cilantro", "price": 11.99, "category": "tacos"},
    {"id": "4", "name": "Loaded Nachos", "description": "Crispy tortilla chips with cheese, jalapeños, sour cream, and guacamole", "price": 7.99, "category": "appetizers"},
    {"id": "5", "name": "Chicken Wings (8pc)", "description": "Crispy wings with your choice of Buffalo, BBQ, or Honey Garlic", "price": 10.99, "category": "appetizers"},
    {"id": "6", "name": "Veggie Wrap", "description": "Fresh vegetables, hummus, and avocado in a spinach tortilla", "price": 6.99, "category": "healthy"},
    {"id": "7", "name": "Loaded Fries", "description": "Crispy fries topped with cheese, bacon, and green onions", "price": 5.99, "category": "sides"},
    {"id": "8", "name": "Fresh Lemonade", "description": "House-made lemonade with real lemons", "price": 3.99, "category": "drinks"},
    {"id": "9", "name": "Craft Root Beer", "description": "Premium root beer on tap", "price": 2.99, "category": "drinks"},
]

# Staff members
STAFF = ['Staff1', 'Staff2', 'Staff3', 'Staff4']
TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']


def ensure_csv_files():
    """Initialize CSV files if they don't exist"""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Users CSV
    if not os.path.exists(USERS_CSV):
        with open(USERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['email', 'password', 'first_name', 'last_name', 'mobile', 'address', 'dob', 'sex', 'registration_date', 'role'])
            # Demo accounts
            writer.writerow(['admin@foodtruck.com', generate_password_hash('admin123'), 'Admin', 'User', '555-0000', 'Admin St', '1990-01-01', 'M', datetime.now().isoformat(), 'admin'])
            writer.writerow(['staff1@foodtruck.com', generate_password_hash('staff123'), 'Staff', 'One', '555-0001', 'Staff St', '1992-01-01', 'F', datetime.now().isoformat(), 'staff'])
            writer.writerow(['customer@foodtruck.com', generate_password_hash('customer123'), 'Customer', 'User', '555-0002', 'Customer St', '1995-01-01', 'M', datetime.now().isoformat(), 'customer'])
    
    # Orders CSV
    if not os.path.exists(ORDERS_CSV):
        with open(ORDERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['order_id', 'email', 'items', 'subtotal', 'tax', 'tip', 'total', 'status', 'created_at'])
    
    # Schedules CSV
    if not os.path.exists(SCHEDULES_CSV):
        with open(SCHEDULES_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['appointment_id', 'manager_email', 'staff_name', 'date', 'time_slot', 'status', 'created_at'])


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
                schedules.append(dict(row))
    return schedules


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


def save_appointment(manager_email, staff_name, date, time_slot):
    """Save appointment to CSV"""
    appointment_id = f"APT{int(datetime.now().timestamp() * 1000)}"
    with open(SCHEDULES_CSV, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([appointment_id, manager_email, staff_name, date, time_slot, 'confirmed', datetime.now().isoformat()])
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
    data = request.json
    manager_email = session.get('user_id')
    staff_name = data.get('staff_name', '')
    date = data.get('date', '')
    time_slot = data.get('time_slot', '')
    
    if not all([staff_name, date, time_slot]):
        return jsonify({'success': False, 'error': 'All fields are required'}), 400
    
    # Check if slot is available
    schedules = read_schedules()
    for s in schedules:
        if s['staff_name'] == staff_name and s['date'] == date and s['time_slot'] == time_slot:
            return jsonify({'success': False, 'error': 'Time slot already booked'}), 400
    
    appointment_id = save_appointment(manager_email, staff_name, date, time_slot)
    
    return jsonify({
        'success': True,
        'appointment_id': appointment_id
    })


# ==================== ADMIN DASHBOARD ====================

@app.route('/api/admin/dashboard', methods=['GET'])
@login_required
@role_required('admin')
def admin_dashboard():
    """Get admin dashboard stats"""
    orders = read_orders()
    schedules = read_schedules()
    
    # Calculate stats
    total_orders = len(orders)
    total_revenue = sum(float(o.get('total', 0)) for o in orders)
    pending_orders = len([o for o in orders if o.get('status') == 'pending'])
    total_appointments = len(schedules)
    
    # Recent orders
    recent_orders = sorted(orders, key=lambda x: x.get('created_at', ''), reverse=True)[:5]
    
    return jsonify({
        'stats': {
            'total_orders': total_orders,
            'total_revenue': round(total_revenue, 2),
            'pending_orders': pending_orders,
            'total_appointments': total_appointments
        },
        'recent_orders': recent_orders
    })


# ==================== STAFF ====================

@app.route('/api/staff', methods=['GET'])
def get_staff():
    """Get staff list"""
    return jsonify(STAFF)


@app.route('/api/time-slots', methods=['GET'])
def get_time_slots():
    """Get available time slots"""
    return jsonify(TIME_SLOTS)


if __name__ == '__main__':
    app.run(debug=True, port=5000)

