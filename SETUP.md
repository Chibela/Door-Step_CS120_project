# Quick Setup Guide

## 🚀 Getting Started

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set a secret key

# Run the server
python app.py
```

Backend will be running on `http://localhost:5000`

### Step 2: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be running on `http://localhost:3000`

## 🎯 Access the Application

1. Open `http://localhost:3000` in your browser
2. Login with demo accounts:
   - **Admin**: `admin@foodtruck.com` / `admin123`
   - **Staff**: `staff1@foodtruck.com` / `staff123`
   - **Customer**: `customer@foodtruck.com` / `customer123`

## 📝 Notes

- Both backend and frontend must be running simultaneously
- CSV files will be auto-created in `backend/data/` on first run
- Demo accounts are created automatically

## 🐛 Troubleshooting

**Port already in use?**
- Backend: Change port in `app.py` (default: 5000)
- Frontend: Change port in `vite.config.js` (default: 3000)

**Module not found?**
- Backend: Ensure virtual environment is activated
- Frontend: Run `npm install` again

**CORS errors?**
- Ensure backend is running
- Check `app.py` CORS configuration

