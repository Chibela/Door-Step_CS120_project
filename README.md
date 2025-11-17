# ServeDash – React + Flask Food Truck Platform

A full-stack ordering and operations system with a minimalist, admin-inspired user experience. Customers browse API-powered menus, staff manage their schedules and profiles, and admins oversee orders, staff, menus, and appointments—all backed by a lightweight CSV database.

---

## ✨ Key Features

### Admin
- Dashboard KPIs, revenue chart, and recent orders
- Live menu viewer sourced from the Free Food Menus API (20 curated dishes)
- Staff directory with add/edit/reset flows
- Booking tool to schedule meetings per staff member
- Schedule board with search, filters, and inline status updates

### Customer
- Modern menu with images, categories, search, and rating badges
- Cart with quantity controls, taxes, and tips
- Order history + order details
- Profile view (placeholder for future edits)

### Staff
- Minimal schedule view with quick actions (confirm / complete / decline)
- Profile center that supports editing personal details and passwords
- Fully synced with admin schedules and appointments

---

## 🧱 Project Structure

```
Door-Step_CS120_project/
├── backend/             # Flask API + CSV persistence + menu cache
│   ├── app.py
│   ├── fetch_menu_data.py
│   └── data/
│       ├── menu_cache.json
│       ├── orders.csv
│       ├── schedules.csv
│       └── users.csv
└── frontend/            # React + Vite + Tailwind + Lucide
    └── src/
        ├── pages/Admin  # Admin Dashboard, Orders, Menu, Staff, Schedules
        ├── pages/Customer
        ├── pages/Staff
        ├── components
        └── services/api.js
```

---

## ✅ Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

---

## ⚙️ Setup & Run

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # update FLASK_SECRET_KEY
python fetch_menu_data.py         # fetch 20 real dishes (optional but recommended)
python app.py                     # runs at http://127.0.0.1:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                       # runs at http://localhost:3000
```

> Both servers must remain running. The React dev server proxies `/api/*` to the Flask API.

---

## 🔑 Demo Accounts
- **Admin**: `admin@foodtruck.com` / `admin123`
- **Staff**: `staff1@foodtruck.com` / `staff123`
- **Customer**: `customer@foodtruck.com` / `customer123`

CSV files in `backend/data/` are auto-created on first run with these accounts.

---

## 🍽️ Menu Data (Free Food Menus API)
1. Run `python fetch_menu_data.py` inside `backend/` to pull 20 curated dishes (burgers, pizzas, fried chicken, desserts).
2. Cached data lives in `backend/data/menu_cache.json`.
3. To refresh:
   ```bash
   cd backend
   source venv/bin/activate
   python fetch_menu_data.py
   python app.py
   ```
4. `/api/menu` always reads the latest cache—so customers and admins stay in sync.

---

## 👩‍💼 Staff Management Workflow
1. **Admin → Staff** page lists all staff profiles and supports add/edit (including temp passwords).
2. Booking tool now references real staff emails; appointments store both `staff_email` and `staff_name`.
3. Staff schedule screen lets team members confirm/complete/cancel slots.
4. `GET /api/staff/profile` + `PUT /api/staff/profile` allow staff to update their own info.

---

## 📡 API Overview (select routes)
- `POST /api/auth/login` · `POST /api/auth/signup` · `GET /api/auth/me`
- `GET /api/menu`
- `GET/POST /api/orders`
- `GET/POST /api/schedules` · `PUT /api/schedules/<appointment_id>`
- `GET /api/admin/dashboard`
- `GET/POST /api/staff` (admin) · `PUT /api/staff/<email>`
- `GET/PUT /api/staff/profile` (staff self-service)

See `frontend/src/services/api.js` for corresponding client helpers.

---

## 📊 CSV Schema
```csv
# users.csv
email,password,first_name,last_name,mobile,address,dob,sex,registration_date,role

# orders.csv
order_id,email,items,subtotal,tax,tip,total,status,created_at

# schedules.csv
appointment_id,manager_email,staff_email,staff_name,date,time_slot,status,notes,created_at
```

All CSV files sit in `backend/data/` and act as the single source of truth.

---

## 🛠️ Troubleshooting

| Issue | Fix |
| --- | --- |
| **403 on login** | Ensure both servers are running; backend should be at http://127.0.0.1:5000. Restart both terminals. |
| **Menu empty** | Rerun `python fetch_menu_data.py` then restart backend. |
| **Port already in use** | `lsof -ti:5000` then `kill -9` the PID (or choose a different port). |
| **CORS errors** | Backend must run at 127.0.0.1:5000 (or update the CORS origins list in `backend/app.py`). |
| **Missing modules** | Reinstall: `pip install -r requirements.txt` and `npm install`. |
| **CSV not created** | Delete `backend/data/`, restart backend to re-seed. |

---

## 🎨 Design Notes
- Minimalistic card layout, soft gradients (`bg-app-gradient`), and Lucide outline icons throughout admin, staff, and customer panels.
- Consistent spacing (`rounded-2xl`, `shadow-xl`, `border border-gray-100`) ensures panels feel cohesive.

---

## 📷 Walkthrough (Optional)
![ServeDash Walkthrough](Images/walkthrough8.gif)

---

Need more automation (e.g., scheduled menu refresh or menu price overrides)? Open an issue or extend the Flask endpoints—everything is structured for small, incremental upgrades. Happy building! 🍔
