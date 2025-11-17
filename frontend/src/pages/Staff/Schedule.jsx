import React, { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getSchedules, logout } from '../../services/api';
import { useToast } from '../../components/Toast';

const StaffSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout: setLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      showToast('Failed to load schedule', 'error');
    } finally {
      setLoading(false);
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

  // Group schedules by date
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Door Step Food Truck</h1>
            <p className="text-gray-500">Staff Schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/profile')}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">{user?.first_name?.[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">Staff</p>
              </div>
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

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSchedules).map(([date, dateSchedules]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <div className="space-y-3">
                    {dateSchedules.map((schedule) => (
                      <div
                        key={schedule.appointment_id}
                        className="bg-gray-50 rounded-xl p-4 border-l-4 border-primary"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{schedule.time_slot}</p>
                              <p className="text-sm text-gray-500">Manager: {schedule.manager_email}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSchedule;
