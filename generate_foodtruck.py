#!/usr/bin/env python3
"""
Door Step Food Truck Ordering System
Modern UI with cart functionality and CSV database.
"""

import csv
import json
import os
from datetime import datetime

# Enhanced menu items for food truck
MENU = [
    {"id": "1", "name": "Classic Cheeseburger", "description": "Juicy beef patty with cheese, lettuce, tomato, and our special sauce", "price": 8.99, "category": "burgers", "image": "🍔"},
    {"id": "2", "name": "BBQ Pulled Pork Sandwich", "description": "Slow-cooked pork with tangy BBQ sauce and coleslaw", "price": 9.99, "category": "sandwiches", "image": "🥪"},
    {"id": "3", "name": "Fish Tacos (3pc)", "description": "Fresh fish with cabbage slaw, lime crema, and cilantro", "price": 11.99, "category": "tacos", "image": "🌮"},
    {"id": "4", "name": "Loaded Nachos", "description": "Crispy tortilla chips with cheese, jalapeños, sour cream, and guacamole", "price": 7.99, "category": "appetizers", "image": "🌮"},
    {"id": "5", "name": "Chicken Wings (8pc)", "description": "Crispy wings with your choice of Buffalo, BBQ, or Honey Garlic", "price": 10.99, "category": "appetizers", "image": "🍗"},
    {"id": "6", "name": "Veggie Wrap", "description": "Fresh vegetables, hummus, and avocado in a spinach tortilla", "price": 6.99, "category": "healthy", "image": "🥙"},
    {"id": "7", "name": "Loaded Fries", "description": "Crispy fries topped with cheese, bacon, and green onions", "price": 5.99, "category": "sides", "image": "🍟"},
    {"id": "8", "name": "Fresh Lemonade", "description": "House-made lemonade with real lemons", "price": 3.99, "category": "drinks", "image": "🍋"},
    {"id": "9", "name": "Craft Root Beer", "description": "Premium root beer on tap", "price": 2.99, "category": "drinks", "image": "🥤"},
]

def ensure_csv_files():
    """Create CSV files if they don't exist"""
    os.makedirs("data", exist_ok=True)
    
    users_csv = "data/users.csv"
    orders_csv = "data/orders.csv"
    
    if not os.path.exists(users_csv):
        with open(users_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["email", "password", "first_name", "last_name", "phone"])
            # Add a sample user for testing
            writer.writerow(["demo@foodtruck.com", "demo123", "Demo", "User", "555-0123"])
    
    if not os.path.exists(orders_csv):
        with open(orders_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["order_id", "email", "items", "total", "status", "created_at"])

def read_csv_data():
    """Read existing CSV data to embed in HTML"""
    users = []
    orders = []
    
    # Read users
    users_csv = "data/users.csv"
    if os.path.exists(users_csv):
        with open(users_csv, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                users.append(dict(row))
    
    # Read orders
    orders_csv = "data/orders.csv"
    if os.path.exists(orders_csv):
        with open(orders_csv, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                orders.append(dict(row))
    
    return users, orders

def generate_html():
    """Generate the complete HTML file with modern food truck UI"""
    
    users, orders = read_csv_data()
    
    # Convert data to JSON for embedding
    menu_json = json.dumps(MENU, indent=2)
    users_json = json.dumps(users, indent=2)
    orders_json = json.dumps(orders, indent=2)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Door Step Food Truck - Order Online</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }}
        
        /* Header */
        .header {{
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 1rem 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }}
        
        .header-content {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .logo {{
            font-size: 2rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .nav {{
            display: flex;
            gap: 2rem;
            align-items: center;
        }}
        
        .nav a {{
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            transition: all 0.3s ease;
            cursor: pointer;
        }}
        
        .nav a:hover {{
            background: rgba(255,255,255,0.2);
            transform: translateY(-2px);
        }}
        
        .user-info {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}
        
        .user-info span {{
            background: rgba(255,255,255,0.2);
            padding: 0.5rem 1rem;
            border-radius: 25px;
        }}
        
        /* Main Content */
        .main-content {{
            padding: 2rem 0;
        }}
        
        .card {{
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            animation: slideUp 0.5s ease;
        }}
        
        @keyframes slideUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        .hero {{
            text-align: center;
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
            color: white;
            margin-bottom: 3rem;
        }}
        
        .hero h1 {{
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }}
        
        .hero p {{
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }}
        
        .cta-buttons {{
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }}
        
        .btn {{
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(255,107,107,0.4);
        }}
        
        .btn:hover {{
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255,107,107,0.6);
        }}
        
        .btn-secondary {{
            background: linear-gradient(135deg, #667eea, #764ba2);
            box-shadow: 0 4px 15px rgba(102,126,234,0.4);
        }}
        
        .btn-secondary:hover {{
            box-shadow: 0 6px 20px rgba(102,126,234,0.6);
        }}
        
        .btn-success {{
            background: linear-gradient(135deg, #56ab2f, #a8e6cf);
            box-shadow: 0 4px 15px rgba(86,171,47,0.4);
        }}
        
        .btn-success:hover {{
            box-shadow: 0 6px 20px rgba(86,171,47,0.6);
        }}
        
        /* Forms */
        .form-group {{
            margin-bottom: 1.5rem;
        }}
        
        .form-group label {{
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #555;
        }}
        
        .form-group input, .form-group select {{
            width: 100%;
            padding: 1rem;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
        }}
        
        .form-group input:focus, .form-group select:focus {{
            outline: none;
            border-color: #ff6b6b;
            box-shadow: 0 0 0 3px rgba(255,107,107,0.1);
        }}
        
        /* Menu Grid */
        .menu-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }}
        
        .menu-item {{
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }}
        
        .menu-item:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            border-color: #ff6b6b;
        }}
        
        .menu-item-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }}
        
        .menu-item-name {{
            font-size: 1.3rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 0.5rem;
        }}
        
        .menu-item-price {{
            font-size: 1.5rem;
            font-weight: 700;
            color: #ff6b6b;
        }}
        
        .menu-item-image {{
            font-size: 3rem;
            margin-bottom: 1rem;
            text-align: center;
        }}
        
        .menu-item-description {{
            color: #666;
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }}
        
        .menu-item-controls {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}
        
        .qty-input {{
            width: 80px !important;
            text-align: center;
        }}
        
        .category-filter {{
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }}
        
        .category-btn {{
            background: white;
            border: 2px solid #e1e5e9;
            color: #666;
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }}
        
        .category-btn.active, .category-btn:hover {{
            background: #ff6b6b;
            color: white;
            border-color: #ff6b6b;
        }}
        
        /* Cart */
        .cart {{
            position: fixed;
            top: 0;
            right: -400px;
            width: 400px;
            height: 100vh;
            background: white;
            box-shadow: -5px 0 20px rgba(0,0,0,0.1);
            transition: right 0.3s ease;
            z-index: 1000;
            overflow-y: auto;
        }}
        
        .cart.open {{
            right: 0;
        }}
        
        .cart-header {{
            background: #ff6b6b;
            color: white;
            padding: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .cart-content {{
            padding: 1.5rem;
        }}
        
        .cart-item {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #eee;
        }}
        
        .cart-item-info h4 {{
            margin-bottom: 0.5rem;
        }}
        
        .cart-item-price {{
            color: #ff6b6b;
            font-weight: 600;
        }}
        
        .cart-total {{
            background: #f8f9fa;
            padding: 1.5rem;
            margin-top: 1rem;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: 700;
            text-align: center;
        }}
        
        .cart-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        }}
        
        .cart-overlay.show {{
            display: block;
        }}
        
        /* Orders */
        .order-item {{
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            border-left: 4px solid #ff6b6b;
        }}
        
        .order-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }}
        
        .order-id {{
            font-weight: 700;
            color: #ff6b6b;
        }}
        
        .order-date {{
            color: #666;
            font-size: 0.9rem;
        }}
        
        .order-items {{
            margin-bottom: 1rem;
        }}
        
        .order-item-detail {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }}
        
        .order-total {{
            font-weight: 700;
            font-size: 1.1rem;
            color: #333;
        }}
        
        /* Alerts */
        .alert {{
            padding: 1rem 1.5rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            font-weight: 500;
        }}
        
        .alert-success {{
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }}
        
        .alert-error {{
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }}
        
        .hidden {{
            display: none !important;
        }}
        
        /* Responsive */
        @media (max-width: 768px) {{
            .hero h1 {{
                font-size: 2rem;
            }}
            
            .nav {{
                flex-direction: column;
                gap: 1rem;
            }}
            
            .menu-grid {{
                grid-template-columns: 1fr;
            }}
            
            .cart {{
                width: 100%;
                right: -100%;
            }}
        }}
    </style>
</head>
<body>
    <!-- Cart Overlay -->
    <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>
    
    <!-- Cart Sidebar -->
    <div class="cart" id="cart">
        <div class="cart-header">
            <h3>🛒 Your Order</h3>
            <button onclick="closeCart()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="cart-content">
            <div id="cartItems">
                <p>Your cart is empty</p>
            </div>
            <div class="cart-total" id="cartTotal">
                Total: $0.00
            </div>
            <button class="btn btn-success" onclick="checkout()" style="width: 100%; margin-top: 1rem;">
                Place Order
            </button>
        </div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    🚚 Door Step Food Truck
                </div>
                <nav class="nav">
                    <a onclick="showPage('home')">Home</a>
                    <a onclick="showPage('menu')">Menu</a>
                    <a onclick="showPage('orders')">My Orders</a>
                    <a onclick="openCart()">Cart (<span id="cartCount">0</span>)</a>
                </nav>
                <div class="user-info" id="userInfo">
                    <span id="userEmail"></span>
                    <a onclick="logout()" id="logoutLink" class="hidden">Logout</a>
                    <a onclick="showPage('login')" id="loginLink">Login</a>
                    <a onclick="showPage('signup')" id="signupLink">Signup</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <div class="container">
            <div id="alertContainer"></div>

            <!-- Home Page -->
            <div id="homePage">
                <div class="card hero">
                    <h1>🍽️ Welcome to Door Step Food Truck!</h1>
                    <p>Fresh, delicious food delivered straight to your door. Order online and enjoy our amazing menu!</p>
                    <div class="cta-buttons" id="homeActions">
                        <button class="btn" onclick="showPage('signup')">Create Account</button>
                        <button class="btn btn-secondary" onclick="showPage('login')">Log In</button>
                    </div>
                </div>
            </div>

            <!-- Signup Page -->
            <div id="signupPage" class="card hidden">
                <h2>Create Your Account</h2>
                <form onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="signupFirstName">First Name:</label>
                        <input type="text" id="signupFirstName" required>
                    </div>
                    <div class="form-group">
                        <label for="signupLastName">Last Name:</label>
                        <input type="text" id="signupLastName" required>
                    </div>
                    <div class="form-group">
                        <label for="signupEmail">Email:</label>
                        <input type="email" id="signupEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPhone">Phone:</label>
                        <input type="tel" id="signupPhone" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password:</label>
                        <input type="password" id="signupPassword" required>
                    </div>
                    <button type="submit" class="btn">Create Account</button>
                    <button type="button" class="btn btn-secondary" onclick="showPage('login')">Already have an account?</button>
                </form>
            </div>

            <!-- Login Page -->
            <div id="loginPage" class="card hidden">
                <h2>Welcome Back!</h2>
                <p style="margin-bottom: 2rem; color: #666;">Try our demo account: <strong>demo@foodtruck.com</strong> / <strong>demo123</strong></p>
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">Email:</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password:</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn">Login</button>
                    <button type="button" class="btn btn-secondary" onclick="showPage('signup')">Need an account?</button>
                </form>
            </div>

            <!-- Menu Page -->
            <div id="menuPage" class="card hidden">
                <h2>🍽️ Our Menu</h2>
                <div class="category-filter">
                    <button class="category-btn active" onclick="filterMenu('all')">All Items</button>
                    <button class="category-btn" onclick="filterMenu('burgers')">Burgers</button>
                    <button class="category-btn" onclick="filterMenu('sandwiches')">Sandwiches</button>
                    <button class="category-btn" onclick="filterMenu('tacos')">Tacos</button>
                    <button class="category-btn" onclick="filterMenu('appetizers')">Appetizers</button>
                    <button class="category-btn" onclick="filterMenu('healthy')">Healthy</button>
                    <button class="category-btn" onclick="filterMenu('sides')">Sides</button>
                    <button class="category-btn" onclick="filterMenu('drinks')">Drinks</button>
                </div>
                <div class="menu-grid" id="menuItems"></div>
            </div>

            <!-- Orders Page -->
            <div id="ordersPage" class="card hidden">
                <h2>📋 My Orders</h2>
                <div id="ordersList">
                    <p>No orders yet.</p>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Data loaded from CSV files by Python script
        const MENU = {menu_json};
        let USERS_DATA = {users_json};
        let ORDERS_DATA = {orders_json};
        
        // Current user session
        let currentUser = null;
        let cart = [];
        let currentFilter = 'all';

        // Show alert message
        function showAlert(message, type = 'success') {{
            const container = document.getElementById('alertContainer');
            container.innerHTML = `<div class="alert alert-${{type}}">${{message}}</div>`;
            setTimeout(() => {{
                container.innerHTML = '';
            }}, 3000);
        }}

        // Show specific page
        function showPage(pageId) {{
            const pages = ['homePage', 'signupPage', 'loginPage', 'menuPage', 'ordersPage'];
            pages.forEach(page => {{
                document.getElementById(page).classList.add('hidden');
            }});
            
            document.getElementById(pageId + 'Page').classList.remove('hidden');
            updateNavigation();
            
            if (pageId === 'menu') {{
                loadMenu();
            }} else if (pageId === 'orders') {{
                loadOrders();
            }}
        }}

        // Update navigation based on login status
        function updateNavigation() {{
            const userEmail = document.getElementById('userEmail');
            const logoutLink = document.getElementById('logoutLink');
            const loginLink = document.getElementById('loginLink');
            const signupLink = document.getElementById('signupLink');
            const homeActions = document.getElementById('homeActions');
            
            if (currentUser) {{
                userEmail.textContent = currentUser.first_name || currentUser.email;
                logoutLink.classList.remove('hidden');
                loginLink.classList.add('hidden');
                signupLink.classList.add('hidden');
                if (homeActions) {{
                    homeActions.innerHTML = `
                        <button class="btn" onclick="showPage('menu')">View Menu</button>
                        <button class="btn btn-secondary" onclick="showPage('orders')">My Orders</button>
                    `;
                }}
            }} else {{
                userEmail.textContent = '';
                logoutLink.classList.add('hidden');
                loginLink.classList.remove('hidden');
                signupLink.classList.remove('hidden');
                if (homeActions) {{
                    homeActions.innerHTML = `
                        <button class="btn" onclick="showPage('signup')">Create Account</button>
                        <button class="btn btn-secondary" onclick="showPage('login')">Log In</button>
                    `;
                }}
            }}
        }}

        // Handle signup
        function handleSignup(event) {{
            event.preventDefault();
            const firstName = document.getElementById('signupFirstName').value.trim();
            const lastName = document.getElementById('signupLastName').value.trim();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const phone = document.getElementById('signupPhone').value.trim();
            const password = document.getElementById('signupPassword').value;
            
            if (!firstName || !lastName || !email || !phone || !password) {{
                showAlert('Please fill in all fields', 'error');
                return;
            }}
            
            if (USERS_DATA.find(user => user.email === email)) {{
                showAlert('Account already exists. Please log in.', 'error');
                return;
            }}
            
            // Add to in-memory data
            USERS_DATA.push({{ 
                email, 
                password, 
                first_name: firstName, 
                last_name: lastName, 
                phone 
            }});
            
            showAlert('Account created successfully! Please log in.', 'success');
            showPage('login');
        }}

        // Handle login
        function handleLogin(event) {{
            event.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            
            const user = USERS_DATA.find(user => user.email === email && user.password === password);
            
            if (!user) {{
                showAlert('Invalid email or password', 'error');
                return;
            }}
            
            currentUser = user;
            showAlert('Welcome back! Ready to order?', 'success');
            showPage('menu');
        }}

        // Handle logout
        function logout() {{
            currentUser = null;
            cart = [];
            updateCart();
            showAlert('Logged out successfully', 'success');
            showPage('home');
        }}

        // Load menu items
        function loadMenu() {{
            const menuContainer = document.getElementById('menuItems');
            let html = '';
            
            const filteredMenu = currentFilter === 'all' 
                ? MENU 
                : MENU.filter(item => item.category === currentFilter);
            
            filteredMenu.forEach(item => {{
                html += `
                    <div class="menu-item">
                        <div class="menu-item-image">${{item.image}}</div>
                        <div class="menu-item-header">
                            <div>
                                <div class="menu-item-name">${{item.name}}</div>
                            </div>
                            <div class="menu-item-price">$${{item.price.toFixed(2)}}</div>
                        </div>
                        <div class="menu-item-description">${{item.description}}</div>
                        <div class="menu-item-controls">
                            <input type="number" id="qty_${{item.id}}" class="qty-input" min="1" value="1">
                            <button class="btn" onclick="addToCart('${{item.id}}')">Add to Cart</button>
                        </div>
                    </div>
                `;
            }});
            
            menuContainer.innerHTML = html;
        }}

        // Filter menu by category
        function filterMenu(category) {{
            currentFilter = category;
            
            // Update active button
            document.querySelectorAll('.category-btn').forEach(btn => {{
                btn.classList.remove('active');
            }});
            event.target.classList.add('active');
            
            loadMenu();
        }}

        // Add item to cart
        function addToCart(itemId) {{
            const item = MENU.find(m => m.id === itemId);
            const quantity = parseInt(document.getElementById(`qty_${{itemId}}`).value) || 1;
            
            const existingItem = cart.find(cartItem => cartItem.id === itemId);
            if (existingItem) {{
                existingItem.quantity += quantity;
            }} else {{
                cart.push({{
                    id: itemId,
                    name: item.name,
                    price: item.price,
                    quantity: quantity,
                    image: item.image
                }});
            }}
            
            updateCart();
            showAlert(`Added ${{quantity}}x ${{item.name}} to cart!`, 'success');
            document.getElementById(`qty_${{itemId}}`).value = 1;
        }}

        // Update cart display
        function updateCart() {{
            const cartCount = document.getElementById('cartCount');
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            if (cart.length === 0) {{
                cartItems.innerHTML = '<p>Your cart is empty</p>';
                cartTotal.textContent = 'Total: $0.00';
                return;
            }}
            
            let html = '';
            let total = 0;
            
            cart.forEach(item => {{
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                html += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${{item.image}} ${{item.name}}</h4>
                            <p>Qty: ${{item.quantity}} × ${{item.price.toFixed(2)}}</p>
                        </div>
                        <div class="cart-item-price">$${{itemTotal.toFixed(2)}}</div>
                    </div>
                `;
            }});
            
            cartItems.innerHTML = html;
            cartTotal.textContent = `Total: $${{total.toFixed(2)}}`;
        }}

        // Open cart
        function openCart() {{
            document.getElementById('cartOverlay').classList.add('show');
            document.getElementById('cart').classList.add('open');
        }}

        // Close cart
        function closeCart() {{
            document.getElementById('cartOverlay').classList.remove('show');
            document.getElementById('cart').classList.remove('open');
        }}

        // Checkout
        function checkout() {{
            if (!currentUser) {{
                showAlert('Please log in to place an order', 'error');
                showPage('login');
                return;
            }}
            
            if (cart.length === 0) {{
                showAlert('Your cart is empty', 'error');
                return;
            }}
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const order = {{
                order_id: `ORD${{Date.now()}}`,
                email: currentUser.email,
                items: JSON.stringify(cart),
                total: total.toFixed(2),
                status: 'pending',
                created_at: new Date().toISOString()
            }};
            
            ORDERS_DATA.push(order);
            cart = [];
            updateCart();
            closeCart();
            
            showAlert(`Order placed successfully! Total: $${{total.toFixed(2)}}`, 'success');
        }}

        // Load and display orders
        function loadOrders() {{
            if (!currentUser) {{
                document.getElementById('ordersList').innerHTML = '<p>Please log in to view orders.</p>';
                return;
            }}
            
            const userOrders = ORDERS_DATA.filter(order => order.email === currentUser.email);
            
            if (userOrders.length === 0) {{
                document.getElementById('ordersList').innerHTML = '<p>No orders yet. Start by adding items to your cart!</p>';
                return;
            }}
            
            let html = '';
            
            userOrders.reverse().forEach(order => {{
                const items = JSON.parse(order.items);
                const orderDate = new Date(order.created_at).toLocaleString();
                
                html += `
                    <div class="order-item">
                        <div class="order-header">
                            <div class="order-id">Order #${{order.order_id}}</div>
                            <div class="order-date">${{orderDate}}</div>
                        </div>
                        <div class="order-items">
                            ${{items.map(item => `
                                <div class="order-item-detail">
                                    <span>${{item.image}} ${{item.name}} × ${{item.quantity}}</span>
                                    <span>$${{(item.price * item.quantity).toFixed(2)}}</span>
                                </div>
                            `).join('')}}
                        </div>
                        <div class="order-total">Total: $${{order.total}}</div>
                    </div>
                `;
            }});
            
            document.getElementById('ordersList').innerHTML = html;
        }}

        // Initialize app
        function init() {{
            updateNavigation();
            showPage('home');
        }}

        // Start the app
        init();
    </script>
</body>
</html>"""

    return html_content

def main():
    """Main function to generate the HTML file with modern food truck UI"""
    print("🚚 Door Step Food Truck Generator")
    print("=" * 40)
    
    # Ensure CSV files exist
    ensure_csv_files()
    print("✅ CSV files initialized")
    
    # Generate HTML with modern UI
    html_content = generate_html()
    
    # Write to file
    output_file = "door_step_foodtruck.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    users, orders = read_csv_data()
    
    print(f"✅ Generated {output_file}")
    print(f"📁 File size: {len(html_content):,} bytes")
    print(f"🍔 Menu items: {len(MENU)}")
    print(f"👥 Users in CSV: {len(users)}")
    print(f"📦 Orders in CSV: {len(orders)}")
    print()
    print("🚀 To use:")
    print(f"   1. Open {output_file} in any web browser")
    print("   2. Try demo account: demo@foodtruck.com / demo123")
    print("   3. Browse menu, add to cart, and place orders")
    print("   4. View your order history")
    print()
    print("🎨 Features:")
    print("   - Modern food truck UI with animations")
    print("   - Shopping cart with real-time updates")
    print("   - Category filtering for menu items")
    print("   - Order history and tracking")
    print("   - Responsive design for mobile/desktop")

if __name__ == "__main__":
    main()
