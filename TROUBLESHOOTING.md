# Troubleshooting Guide

## Login 403 Forbidden Error

If you're getting a 403 Forbidden error when trying to login:

### Solution 1: Restart Both Servers

1. **Stop both servers** (Ctrl+C in both terminals)
2. **Restart backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python app.py
   ```
3. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Solution 2: Check Backend is Running

Verify backend is running on port 5000:
```bash
curl http://localhost:5000/api/menu
```

You should see JSON menu data. If not, backend isn't running.

### Solution 3: Check CORS Configuration

Make sure in `backend/app.py` line 18, CORS includes:
```python
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
     supports_credentials=True)
```

### Solution 4: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 5: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Check the `/api/auth/login` request:
   - Status should be 200 or 401 (not 403)
   - Request URL should be `http://localhost:3000/api/auth/login`
   - Response should show JSON

### Solution 6: Verify Proxy Configuration

In `frontend/vite.config.js`, make sure proxy is configured:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false
  }
}
```

### Solution 7: Test Backend Directly

Test if backend login works:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodtruck.com","password":"admin123"}'
```

Should return JSON with user data.

## Common Issues

### Port Already in Use
```bash
# Find process using port 5000
lsof -ti:5000

# Kill it
kill -9 $(lsof -ti:5000)
```

### Module Not Found
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### CSV Files Not Created
Backend creates CSV files automatically on first run. If they don't exist:
1. Make sure `backend/data/` directory exists
2. Restart backend server
3. Check file permissions

## Still Having Issues?

1. Check browser console for errors
2. Check backend terminal for error messages
3. Verify both servers are running
4. Try accessing `http://localhost:5000/api/menu` directly in browser

