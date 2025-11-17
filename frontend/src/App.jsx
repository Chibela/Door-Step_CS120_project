import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminOrders from './pages/Admin/Orders';
import AdminBookAppointment from './pages/Admin/BookAppointment';
import AdminSchedules from './pages/Admin/Schedules';
import CustomerMenu from './pages/Customer/Menu';
import CustomerCart from './pages/Customer/Cart';
import CustomerOrders from './pages/Customer/Orders';
import CustomerOrderDetails from './pages/Customer/OrderDetails';
import CustomerProfile from './pages/Customer/Profile';
import StaffSchedule from './pages/Staff/Schedule';
import StaffProfile from './pages/Staff/Profile';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="book-appointment" element={<AdminBookAppointment />} />
                    <Route path="schedules" element={<AdminSchedules />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <Routes>
                    <Route path="menu" element={<CustomerMenu />} />
                    <Route path="cart" element={<CustomerCart />} />
                    <Route path="orders" element={<CustomerOrders />} />
                    <Route path="orders/:orderId" element={<CustomerOrderDetails />} />
                    <Route path="profile" element={<CustomerProfile />} />
                    <Route path="*" element={<Navigate to="/customer/menu" />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Routes>
                    <Route path="schedule" element={<StaffSchedule />} />
                    <Route path="profile" element={<StaffProfile />} />
                    <Route path="*" element={<Navigate to="/staff/schedule" />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

