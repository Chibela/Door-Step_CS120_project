# 🚀 Quick Start - Get Running in 5 Minutes

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional, but recommended)
echo "FLASK_SECRET_KEY=your-secret-key-here" > .env

# Run the server
python app.py
```

✅ Backend should now be running on `http://localhost:5000`

## Step 2: Frontend Setup (Terminal 2 - New Terminal Window)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (this may take a few minutes)
npm install

# Run development server
npm run dev
```

✅ Frontend should now be running on `http://localhost:3000`

## Step 3: Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. You'll see the login page
3. Use one of these demo accounts:

### Demo Accounts:
- **Admin**: `admin@foodtruck.com` / `admin123`
  - Access: Dashboard, Orders, Book Appointments, Schedules
- **Staff**: `staff1@foodtruck.com` / `staff123`
  - Access: Schedule view, Profile
- **Customer**: `customer@foodtruck.com` / `customer123`
  - Access: Menu, Cart, Orders, Profile

## 🎯 What to Test

### As Admin:
1. ✅ View dashboard with KPI cards
2. ✅ View all orders
3. ✅ Book an appointment (select staff, date, time)
4. ✅ View all schedules

### As Customer:
1. ✅ Browse menu with category filters
2. ✅ Add items to cart
3. ✅ Adjust quantities
4. ✅ Place order with tip selection
5. ✅ View order history

### As Staff:
1. ✅ View personal schedule
2. ✅ See assigned appointments
3. ✅ View profile

## 🐛 Troubleshooting

### Backend won't start?
- Make sure virtual environment is activated
- Check if port 5000 is already in use
- Verify all dependencies installed: `pip list`

### Frontend won't start?
- Make sure you're in the `frontend` directory
- Try deleting `node_modules` and running `npm install` again
- Check Node.js version: `node --version` (should be 16+)

### Can't login?
- Make sure backend is running
- Check browser console for errors
- Verify CSV files were created in `backend/data/`

### CORS errors?
- Ensure backend is running on port 5000
- Check `app.py` line 18 for CORS configuration

## 📝 Next Steps After Testing

1. **Customize Menu**: Edit `MENU` array in `backend/app.py`
2. **Add More Staff**: Edit `STAFF` array in `backend/app.py`
3. **Customize Colors**: Edit `tailwind.config.js` in `frontend/`
4. **Add Features**: Extend the API and frontend components

## 🎨 Design Customization

- **Colors**: Edit `frontend/tailwind.config.js`
- **Fonts**: Already using Inter (configured in `index.html`)
- **Icons**: Using Lucide React (already imported)

## 📊 Data Storage

All data is stored in CSV files in `backend/data/`:
- `users.csv` - All user accounts
- `orders.csv` - All food orders
- `schedules.csv` - All appointments

These are created automatically on first run.

---

**Ready to go!** 🎉

