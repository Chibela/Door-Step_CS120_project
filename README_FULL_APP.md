# Door Step Food Truck - Full Stack Application

A complete food truck management system with React frontend and Flask backend, featuring role-based access for Admin, Customer, and Staff.

## 🎨 Design Features

- **Inter Font**: Clean, professional typography
- **Lucide React Icons**: Modern outline icons (no emojis)
- **Tailwind CSS**: Utility-first styling
- **Role-based Design**: Different color schemes for each role
  - Admin: Blue/Purple/Pink gradient
  - Customer: Orange/Pink gradient
  - Staff: Blue/Teal gradient

## 📁 Project Structure

```
Door-Step_CS120_project/
├── backend/                 # Flask API
│   ├── app.py              # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── data/                # CSV database (auto-created)
│       ├── users.csv
│       ├── orders.csv
│       └── schedules.csv
│
└── frontend/                # React Application
    ├── package.json         # Node dependencies
    ├── vite.config.js       # Vite configuration
    ├── tailwind.config.js   # Tailwind configuration
    └── src/
        ├── main.jsx         # Entry point
        ├── App.jsx          # Main app component
        ├── components/      # Reusable components
        ├── pages/           # Page components
        ├── services/        # API services
        └── context/         # React context
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env and set FLASK_SECRET_KEY
```

5. Run Flask server:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 👥 Demo Accounts

The system creates demo accounts automatically:

- **Admin**: `admin@foodtruck.com` / `admin123`
- **Staff**: `staff1@foodtruck.com` / `staff123`
- **Customer**: `customer@foodtruck.com` / `customer123`

## 🎯 Features

### Admin Panel
- Dashboard with KPI cards and revenue charts
- View all orders
- Book staff appointments
- View all schedules
- Manage system

### Customer Panel
- Browse menu with category filters
- Shopping cart with quantity controls
- Place orders with tax and tip
- View order history
- Profile management

### Staff Panel
- View personal schedule
- See assigned appointments
- Profile management

## 🔧 Technology Stack

### Backend
- Flask 2.3.0
- Flask-CORS for API access
- Werkzeug for password hashing
- CSV for data storage

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for data visualization

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu` - Get all menu items

### Orders
- `GET /api/orders` - Get user orders (or all for admin)
- `POST /api/orders` - Create new order

### Schedules
- `GET /api/schedules` - Get schedules
- `POST /api/schedules` - Create appointment (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics

### Staff
- `GET /api/staff` - Get staff list
- `GET /api/time-slots` - Get available time slots

## 🎨 Design System

### Colors

**Admin:**
- Primary: `#6366f1` (Indigo)
- Accent: `#fbbf24` (Yellow)
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)

**Customer:**
- Primary: `#ff6b6b` (Red/Orange)
- Accent: `#ff9a9e` (Light Pink)

**Staff:**
- Primary: `#4a90e2` (Blue)
- Accent: `#6bb3ff` (Light Blue)

### Typography
- Font Family: Inter (Google Fonts)
- Weights: 300, 400, 500, 600, 700, 800

## 🔒 Security Features

- Password hashing with Werkzeug
- Session-based authentication
- Role-based access control
- CORS configuration
- Input validation

## 📝 CSV Schema

### users.csv
```csv
email,password,first_name,last_name,mobile,address,dob,sex,registration_date,role
```

### orders.csv
```csv
order_id,email,items,subtotal,tax,tip,total,status,created_at
```

### schedules.csv
```csv
appointment_id,manager_email,staff_name,date,time_slot,status,created_at
```

## 🛠️ Development

### Backend Development
```bash
cd backend
python app.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
Deploy Flask app to your preferred hosting (Heroku, Railway, DigitalOcean, etc.)

## 📦 Dependencies

### Backend (requirements.txt)
```
Flask==2.3.0
flask-cors==4.0.0
python-dotenv==1.0.0
werkzeug==2.3.0
```

### Frontend (package.json)
```
react: ^18.2.0
react-router-dom: ^6.20.0
axios: ^1.6.2
lucide-react: ^0.294.0
recharts: ^2.10.3
tailwindcss: ^3.3.6
```

## 🐛 Troubleshooting

### Backend Issues
- Ensure virtual environment is activated
- Check that port 5000 is not in use
- Verify `.env` file exists with `FLASK_SECRET_KEY`

### Frontend Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that backend is running on port 5000
- Verify Vite proxy configuration in `vite.config.js`

### CORS Issues
- Ensure Flask-CORS is properly configured
- Check that frontend URL is in CORS origins list

## 📄 License

This project is for educational purposes (CS120).

## 👨‍💻 Author

Door Step Food Truck Management System

---

**Note**: This is a full-stack application with separate frontend and backend. Both must be running simultaneously for the application to work.

