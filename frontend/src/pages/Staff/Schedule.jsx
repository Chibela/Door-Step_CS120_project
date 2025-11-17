import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Calendar, Clock, User, LogOut, CheckCircle, XCircle, ClipboardCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getSchedules, logout, updateAppointment } from '../../services/api';
import { useToast } from '../../components/Toast';

const StaffSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
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

  const convertToDateObj = (schedule) => {
    if (!schedule.date || !schedule.time_slot) return null;
    const [time, meridiem] = schedule.time_slot.split(' ');
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    const iso = `${schedule.date}T${String(h).padStart(2, '0')}:${minutes || '00'}:00`;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const enhancedSchedules = useMemo(
    () =>
      schedules
        .map((schedule) => ({ ...schedule, dateObj: convertToDateObj(schedule) }))
        .sort((a, b) => {
          if (!a.dateObj) return 1;
          if (!b.dateObj) return -1;
          return a.dateObj - b.dateObj;
        }),
    [schedules]
  );

  const groupedSchedules = useMemo(() => {
    return enhancedSchedules.reduce((acc, schedule) => {
      const date = schedule.date || 'Unscheduled';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(schedule);
      return acc;
    }, {});
  }, [enhancedSchedules]);

  const now = new Date();
  const upcomingSchedules = enhancedSchedules.filter(
    (schedule) =>
      ['scheduled', 'confirmed'].includes(schedule.status) && schedule.dateObj && schedule.dateObj >= now
  );
  const nextShift = upcomingSchedules[0];
  const pendingCount = schedules.filter((s) => s.status === 'scheduled').length;
  const completedCount = schedules.filter((s) => s.status === 'completed').length;
  const thisWeekCompleted = schedules.filter((s) => {
    if (s.status !== 'completed') return false;
    const dateObj = convertToDateObj(s);
    if (!dateObj) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return dateObj >= weekAgo;
  }).length;

  const statsCards = [
    {
      title: 'Upcoming Shifts',
      value: upcomingSchedules.length,
      detail: nextShift
        ? `${new Date(nextShift.date).toLocaleDateString()} • ${nextShift.time_slot}`
        : 'No shift scheduled',
      icon: Calendar,
    },
    {
      title: 'Pending Actions',
      value: pendingCount,
      detail: 'Awaiting confirmation',
      icon: AlertCircle,
    },
    {
      title: 'Completed (7d)',
      value: thisWeekCompleted,
      detail: `${completedCount} total completed`,
      icon: ClipboardCheck,
    },
  ];

  const handleStatusChange = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId);
      await updateAppointment(appointmentId, { status });
      showToast('Schedule updated', 'success');
      loadSchedules();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update schedule', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const quickActions = [
    { label: 'Confirm', status: 'confirmed', icon: CheckCircle, className: 'text-green-600' },
    { label: 'Complete', status: 'completed', icon: CheckCircle, className: 'text-primary-dark' },
    { label: 'Decline', status: 'cancelled', icon: XCircle, className: 'text-red-600' },
  ];

  const actionItems = upcomingSchedules.slice(0, 3);

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-dark">ServeDash</h1>
              <p className="text-text-light">Staff Schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/staff/profile')}
              className="flex items-center gap-2 hover:bg-dust-grey px-3 py-2 rounded-lg transition-all"
            >
              <div className="w-10 h-10 bg-primary-dark rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-semibold">{user?.first_name?.[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-text-dark">
                  {user ? `${user.first_name} ${user.last_name}`.trim() : 'Staff Name'}
                </p>
                <p className="text-xs text-text-light">Staff</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-accent hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5 text-text-dark" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-light">{card.title}</p>
                <div className="w-9 h-9 bg-dust-grey rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-text-dark">{card.value}</p>
              <p className="text-xs text-text-light">{card.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-dark">Action Center</h2>
            <p className="text-sm text-text-light">Keep everything in sync</p>
          </div>
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map((schedule) => (
                <div key={`action-${schedule.appointment_id}`} className="p-4 rounded-xl bg-dust-grey/40 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-text-dark">{schedule.time_slot}</p>
                    <p className="text-xs text-text-light">{schedule.date}</p>
                    <p className="text-xs text-text-light">Manager: {schedule.manager_email}</p>
                  </div>
                  <div className="flex gap-2">
                    {quickActions.map(({ label, status, icon: Icon, className }) => (
                      <button
                        key={status}
                        disabled={updatingId === schedule.appointment_id}
                        onClick={() => handleStatusChange(schedule.appointment_id, status)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-white shadow ${className} hover:shadow-md transition-all disabled:opacity-60`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-light text-sm">No pending actions — you're all set!</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-dark">My Schedule</h2>
              <p className="text-sm text-text-light mt-1">{schedules.length} appointment{schedules.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-text-dark">Loading schedule...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-dust-grey mx-auto mb-4" />
              <p className="text-text-light text-lg">No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSchedules).map(([date, dateSchedules]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold text-text-dark mb-4">
                    {date !== 'Unscheduled'
                      ? new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Awaiting date'}
                  </h3>
                  <div className="space-y-3">
                    {dateSchedules.map((schedule) => (
                      <div
                        key={schedule.appointment_id}
                        className="bg-dust-grey/30 rounded-xl p-4 border-l-4 border-primary hover:bg-dust-grey/50 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-text-dark">{schedule.time_slot}</p>
                              <p className="text-sm text-text-light">Manager: {schedule.manager_email}</p>
                              {schedule.notes && (
                                <p className="text-xs text-text-light mt-1">Notes: {schedule.notes}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              schedule.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : schedule.status === 'completed'
                                ? 'bg-primary/10 text-primary-dark'
                                : schedule.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quickActions.map(({ label, status, icon: Icon, className }) => (
                            <button
                              key={status}
                              disabled={updatingId === schedule.appointment_id}
                              onClick={() => handleStatusChange(schedule.appointment_id, status)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white text-sm font-medium shadow ${className} hover:shadow-md transition-all disabled:opacity-60`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </button>
                          ))}
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
