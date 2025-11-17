# 🚀 ServeDash - Modern Ordering System

A beautiful, modern food ordering system built with React and Flask. Features a stunning UI with shopping cart, category filtering, and order management.

## 🎨 Modern Food Truck UI

This project demonstrates:

- **Python CSV Database**: File I/O with CSV modules
- **Modern Web Design**: Gradient backgrounds, animations, responsive layout
- **Shopping Cart**: Real-time cart updates and checkout
- **Category Filtering**: Filter menu by food categories
- **Order Management**: Complete order history and tracking
- **Mobile Responsive**: Works on all devices

## 📁 Project Structure

```
Door-Step_CS120_project/
├── generate_foodtruck.py    # Main Python script
├── door_step_foodtruck.html # Generated HTML app (32KB)
├── data/
│   ├── users.csv           # User accounts database
│   └── orders.csv          # Orders database
└── README.md               # This file
```

## 🚀 How to Use

### 1. Generate the App

```bash
python3 generate_foodtruck.py
```

### 2. Open in Browser

```bash
open door_step_foodtruck.html
# or double-click the file
```

### 3. Test the System

- **Demo Login**: `demo@foodtruck.com` / `demo123`
- **Signup**: Create new accounts with full details
- **Menu**: Browse 9 food items across 7 categories
- **Cart**: Add items, adjust quantities, checkout
- **Orders**: View complete order history

## 🎥 Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='https://raw.githubusercontent.com/Chibela/Door-Step_CS120_project/main/Images/walkthrough8.gif' title='FoodTruck Video Walkthrough' alt='FoodTruck Video Walkthrough' />

GIF created with [ScreenToGif](https://www.screentogif.com/) for Windows

## 🍔 Enhanced Features

### **Modern UI Design**

- Gradient backgrounds and smooth animations
- Card-based layout with hover effects
- Mobile-responsive design
- Professional food truck branding

### **Shopping Cart System**

- Real-time cart updates
- Sidebar cart with overlay
- Quantity adjustments
- Total price calculations

### **Menu Categories**

- **Burgers**: Classic Cheeseburger ($8.99)
- **Sandwiches**: BBQ Pulled Pork ($9.99)
- **Tacos**: Fish Tacos 3pc ($11.99)
- **Appetizers**: Loaded Nachos ($7.99), Chicken Wings ($10.99)
- **Healthy**: Veggie Wrap ($6.99)
- **Sides**: Loaded Fries ($5.99)
- **Drinks**: Fresh Lemonade ($3.99), Craft Root Beer ($2.99)

### **User Management**

- Full registration (name, email, phone, password)
- Secure login system
- User-specific order history
- Session management

## 📊 CSV Database Schema

### Users (`data/users.csv`)

```csv
email,password,first_name,last_name,phone
demo@foodtruck.com,demo123,Demo,User,555-0123
```

### Orders (`data/orders.csv`)

```csv
order_id,email,items,total,status,created_at
```

## 🔄 Data Persistence

- **Read**: Python reads CSV files and embeds data in HTML
- **Write**: New data stored in memory during session
- **Persist**: Run `python3 generate_foodtruck.py` to refresh with latest CSV data

## 🛠️ Python Modules Used

- `csv` - CSV file reading/writing
- `json` - Data serialization for HTML embedding
- `os` - File system operations
- `datetime` - Timestamp generation

## 🎯 Learning Objectives

- **Python File I/O**: CSV database management
- **Web Development**: HTML/CSS/JavaScript integration
- **UI/UX Design**: Modern responsive interfaces
- **Data Structures**: JSON serialization and parsing
- **E-commerce Logic**: Shopping cart and order management

## 🔧 Customization

Edit `generate_foodtruck.py` to:

- Add more menu items and categories
- Modify pricing and descriptions
- Change color schemes and styling
- Add new features (reviews, ratings, etc.)
- Update CSV structure

## 📱 Mobile Features

- Responsive grid layout
- Touch-friendly buttons
- Mobile-optimized cart sidebar
- Swipe-friendly navigation

---

**Note**: This is a demonstration project for CS120. Features a modern food truck UI with CSV database backend, showcasing Python web development skills.
