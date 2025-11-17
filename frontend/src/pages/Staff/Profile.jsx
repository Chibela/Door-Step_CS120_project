import React, { useState, useEffect, useContext } from 'react';
import { Mail, Phone, MapPin, Calendar, UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getCurrentUser, logout } from '../../services/api';
import { useToast } from '../../components/Toast';

const StaffProfile = () => {
  const { user: contextUser, logout: setLogout } = useContext(AuthContext);
  const [user, setUser] = useState(contextUser);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      showToast('Failed to load profile', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLogout();
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (error) {
      showToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Door Step Food Truck</h1>
            <p className="text-gray-500">Staff Profile</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/schedule')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Back to Schedule
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

          {user && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-semibold text-gray-900">{user.mobile}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-semibold text-gray-900">{user.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold text-gray-900">
                      {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <UserCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Sex</p>
                    <p className="font-semibold text-gray-900">{user.sex || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
