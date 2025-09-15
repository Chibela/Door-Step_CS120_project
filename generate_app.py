#!/usr/bin/env python3
"""
Door Step Ordering System Generator
Uses CSV files as database and generates a standalone HTML file.
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

def add_user_to_csv(email, password):
    """Add a new user to CSV file"""
    with open("data/users.csv", "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([email, password])

def add_order_to_csv(order_data):
    """Add a new order to CSV file"""
    with open("data/orders.csv", "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            order_data["order_id"],
            order_data["email"],
            order_data["item_id"],
            order_data["item_name"],
            order_data["qty"],
            order_data["unit_price"],
            order_data["total"],
            order_data["created_at"]
        ])

def generate_html():
    """Generate the complete HTML file with embedded CSV data"""
    
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
    <title>Door Step - CSV Database</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; background: #f7f7f9; }}
        .container {{ max-width: 600px; margin: 20px auto; padding: 0 20px; }}
        .card {{ background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .nav {{ background: #ff6600; padding: 15px; text-align: center; }}
        .nav a {{ color: #fff; text-decoration: none; margin: 0 15px; font-weight: bold; cursor: pointer; }}
        .nav a:hover {{ text-decoration: underline; }}
        .form-group {{ margin-bottom: 15px; }}
        .form-group label {{ display: block; margin-bottom: 5px; font-weight: bold; }}
        .form-group input, .form-group select {{ width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }}
        .btn {{ background: #ff6600; color: #fff; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; }}
        .btn:hover {{ background: #e55a00; }}
        .btn-secondary {{ background: #6c757d; }}
        .btn-secondary:hover {{ background: #5a6268; }}
        .alert {{ padding: 10px; border-radius: 4px; margin-bottom: 15px; }}
        .alert-success {{ background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
        .alert-error {{ background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
        .hidden {{ display: none; }}
        .menu-item {{ border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 4px; }}
        .menu-item h3 {{ margin: 0 0 10px 0; color: #ff6600; }}
        .menu-item .price {{ font-weight: bold; color: #28a745; font-size: 18px; }}
        .order-item {{ border-bottom: 1px solid #eee; padding: 10px 0; }}
        .order-item:last-child {{ border-bottom: none; }}
        .user-info {{ float: right; color: #fff; }}
        .user-info a {{ color: #fff; text-decoration: none; cursor: pointer; }}
        .user-info a:hover {{ text-decoration: underline; }}
        .qty-input {{ width: 80px !important; display: inline-block; }}
        .csv-info {{ background: #e7f3ff; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="nav">
        <a onclick="showPage('home')">Home</a>
        <a onclick="showPage('menu')">Menu</a>
        <a onclick="showPage('orders')">My Orders</a>
        <a onclick="showPage('csv')">CSV Data</a>
        <div class="user-info" id="userInfo">
            <span id="userEmail"></span>
            <a onclick="logout()" id="logoutLink" class="hidden">Logout</a>
            <a onclick="showPage('login')" id="loginLink">Login</a>
            <a onclick="showPage('signup')" id="signupLink">Signup</a>
        </div>
    </div>

    <div class="container">
        <div id="alertContainer"></div>

        <!-- Home Page -->
        <div id="homePage" class="card">
            <h2>Welcome to Door Step</h2>
            <div class="csv-info">
                <strong>🗂️ CSV Database System</strong><br>
                Data is stored in CSV files: data/users.csv and data/orders.csv<br>
                Generated by Python script with embedded CSV data
            </div>
            <p>Simple ordering system using CSV files as database!</p>
            <div id="homeActions">
                <button class="btn" onclick="showPage('signup')">Create Account</button>
                <button class="btn btn-secondary" onclick="showPage('login')">Log In</button>
            </div>
        </div>

        <!-- Signup Page -->
        <div id="signupPage" class="card hidden">
            <h2>Create Account</h2>
            <div class="csv-info">New users will be added to data/users.csv</div>
            <form onsubmit="handleSignup(event)">
                <div class="form-group">
                    <label for="signupEmail">Email:</label>
                    <input type="email" id="signupEmail" required>
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
            <h2>Login</h2>
            <div class="csv-info">Try: test@example.com / password123</div>
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
            <h2>Menu</h2>
            <div class="csv-info">Orders will be saved to data/orders.csv with price calculations</div>
            <div id="menuItems"></div>
        </div>

        <!-- Orders Page -->
        <div id="ordersPage" class="card hidden">
            <h2>My Orders</h2>
            <div class="csv-info">Data loaded from data/orders.csv</div>
            <div id="ordersList">
                <p>No orders yet.</p>
            </div>
        </div>

        <!-- CSV Data Page -->
        <div id="csvPage" class="card hidden">
            <h2>CSV Database Contents</h2>
            <div class="csv-info">Live view of CSV data embedded in this page</div>
            
            <h3>Users (data/users.csv)</h3>
            <div id="usersData"></div>
            
            <h3>Orders (data/orders.csv)</h3>
            <div id="ordersData"></div>
            
            <h3>Menu (defined in Python)</h3>
            <div id="menuData"></div>
        </div>
    </div>

    <script>
        // Data loaded from CSV files by Python script
        const MENU = {menu_json};
        let USERS_DATA = {users_json};
        let ORDERS_DATA = {orders_json};
        
        // Current user session
        let currentUser = null;

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
            const pages = ['homePage', 'signupPage', 'loginPage', 'menuPage', 'ordersPage', 'csvPage'];
            pages.forEach(page => {{
                document.getElementById(page).classList.add('hidden');
            }});
            
            document.getElementById(pageId + 'Page').classList.remove('hidden');
            updateNavigation();
            
            if (pageId === 'menu') {{
                loadMenu();
            }} else if (pageId === 'orders') {{
                loadOrders();
            }} else if (pageId === 'csv') {{
                loadCSVData();
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
                userEmail.textContent = currentUser.email;
                logoutLink.classList.remove('hidden');
                loginLink.classList.add('hidden');
                signupLink.classList.add('hidden');
                if (homeActions) {{
                    homeActions.innerHTML = `
                        <button class="btn" onclick="showPage('menu')">View Menu</button>
                        <button class="btn btn-secondary" onclick="showPage('orders')">My Orders</button>
                        <button class="btn btn-secondary" onclick="showPage('csv')">View CSV Data</button>
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
                        <button class="btn btn-secondary" onclick="showPage('csv')">View CSV Data</button>
                    `;
                }}
            }}
        }}

        // Handle signup
        function handleSignup(event) {{
            event.preventDefault();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const password = document.getElementById('signupPassword').value;
            
            if (!email || !password) {{
                showAlert('Please fill in all fields', 'error');
                return;
            }}
            
            if (USERS_DATA.find(user => user.email === email)) {{
                showAlert('Account already exists. Please log in.', 'error');
                return;
            }}
            
            // Add to in-memory data
            USERS_DATA.push({{ email, password }});
            
            // Note: In real implementation, this would call Python script to update CSV
            showAlert('Account created successfully! (Note: To persist, run Python script again)', 'success');
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
            showAlert('Logged in successfully!');
            showPage('menu');
        }}

        // Handle logout
        function logout() {{
            currentUser = null;
            showAlert('Logged out successfully');
            showPage('home');
        }}

        // Load menu items
        function loadMenu() {{
            const menuContainer = document.getElementById('menuItems');
            let html = '';
            
            MENU.forEach(item => {{
                html += `
                    <div class="menu-item">
                        <h3>${{item.name}}</h3>
                        <p>${{item.description}}</p>
                        <div class="price">$${{item.price.toFixed(2)}}</div>
                        <div class="form-group">
                            <label>Quantity:</label>
                            <input type="number" id="qty_${{item.id}}" class="qty-input" min="1" value="1">
                            <button class="btn" onclick="addToOrder('${{item.id}}')">Add to Order</button>
                        </div>
                    </div>
                `;
            }});
            
            menuContainer.innerHTML = html;
        }}

        // Add item to order
        function addToOrder(itemId) {{
            if (!currentUser) {{
                showAlert('Please log in to place orders', 'error');
                showPage('login');
                return;
            }}
            
            const item = MENU.find(m => m.id === itemId);
            const quantity = parseInt(document.getElementById(`qty_${{itemId}}`).value) || 1;
            const total = item.price * quantity;
            
            const order = {{
                order_id: `ORD${{Date.now()}}`,
                email: currentUser.email,
                item_id: itemId,
                item_name: item.name,
                qty: quantity.toString(),
                unit_price: item.price.toString(),
                total: total.toFixed(2),
                created_at: new Date().toISOString()
            }};
            
            // Add to in-memory data
            ORDERS_DATA.push(order);
            
            showAlert(`Added ${{quantity}}x ${{item.name}} to order. Total: $${{total.toFixed(2)}} (Note: To persist, run Python script again)`);
            document.getElementById(`qty_${{itemId}}`).value = 1;
        }}

        // Load and display orders
        function loadOrders() {{
            if (!currentUser) {{
                document.getElementById('ordersList').innerHTML = '<p>Please log in to view orders.</p>';
                return;
            }}
            
            const userOrders = ORDERS_DATA.filter(order => order.email === currentUser.email);
            
            if (userOrders.length === 0) {{
                document.getElementById('ordersList').innerHTML = '<p>No orders yet.</p>';
                return;
            }}
            
            let html = '<div class="order-item"><strong>Recent Orders:</strong></div>';
            let totalSpent = 0;
            
            userOrders.reverse().forEach(order => {{
                totalSpent += parseFloat(order.total);
                html += `
                    <div class="order-item">
                        <strong>${{order.item_name}}</strong> - Qty: ${{order.qty}} - $${{parseFloat(order.unit_price).toFixed(2)}} each<br>
                        <small>Total: $${{parseFloat(order.total).toFixed(2)}} | ${{new Date(order.created_at).toLocaleString()}}</small>
                    </div>
                `;
            }});
            
            html += `<div class="order-item"><strong>Total Spent: $${{totalSpent.toFixed(2)}}</strong></div>`;
            document.getElementById('ordersList').innerHTML = html;
        }}

        // Load CSV data view
        function loadCSVData() {{
            // Users data
            let usersHtml = '<table border="1" style="width:100%; border-collapse: collapse;"><tr><th>Email</th><th>Password</th></tr>';
            USERS_DATA.forEach(user => {{
                usersHtml += `<tr><td>${{user.email}}</td><td>${{user.password}}</td></tr>`;
            }});
            usersHtml += '</table>';
            document.getElementById('usersData').innerHTML = usersHtml;
            
            // Orders data
            let ordersHtml = '<table border="1" style="width:100%; border-collapse: collapse;"><tr><th>Order ID</th><th>Email</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr>';
            ORDERS_DATA.forEach(order => {{
                ordersHtml += `<tr><td>${{order.order_id}}</td><td>${{order.email}}</td><td>${{order.item_name}}</td><td>${{order.qty}}</td><td>$${{parseFloat(order.unit_price).toFixed(2)}}</td><td>$${{parseFloat(order.total).toFixed(2)}}</td><td>${{new Date(order.created_at).toLocaleString()}}</td></tr>`;
            }});
            ordersHtml += '</table>';
            document.getElementById('ordersData').innerHTML = ordersHtml;
            
            // Menu data
            let menuHtml = '<table border="1" style="width:100%; border-collapse: collapse;"><tr><th>ID</th><th>Name</th><th>Description</th><th>Price</th></tr>';
            MENU.forEach(item => {{
                menuHtml += `<tr><td>${{item.id}}</td><td>${{item.name}}</td><td>${{item.description}}</td><td>$${{item.price.toFixed(2)}}</td></tr>`;
            }});
            menuHtml += '</table>';
            document.getElementById('menuData').innerHTML = menuHtml;
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
    """Main function to generate the HTML file with CSV database"""
    print("🚀 Door Step CSV Database Generator")
    print("=" * 40)
    
    # Ensure CSV files exist
    ensure_csv_files()
    print("✅ CSV files initialized")
    
    # Generate HTML with embedded CSV data
    html_content = generate_html()
    
    # Write to file
    output_file = "door_step_csv_app.html"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    users, orders = read_csv_data()
    
    print(f"✅ Generated {output_file}")
    print(f"📁 File size: {len(html_content):,} bytes")
    print(f"🍕 Menu items: {len(MENU)}")
    print(f"👥 Users in CSV: {len(users)}")
    print(f"📦 Orders in CSV: {len(orders)}")
    print()
    print("📂 CSV Files:")
    print("   - data/users.csv (user accounts)")
    print("   - data/orders.csv (order history)")
    print()
    print("🚀 To use:")
    print(f"   1. Open {output_file} in any web browser")
    print("   2. View CSV data in the 'CSV Data' tab")
    print("   3. Create accounts, login, and place orders")
    print("   4. Run this script again to refresh with latest CSV data")
    print()
    print("🔄 To persist new data:")
    print("   - Manually add to CSV files, or")
    print("   - Extend this script to write back to CSV files")

if __name__ == "__main__":
    main()
