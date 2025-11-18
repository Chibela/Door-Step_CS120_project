import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ClipboardList, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSchedules, getStaffProfile } from '../../services/api';
import { useToast } from '../../components/Toast';
import StaffHeader from '../../components/Staff/Header';

const StaffDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scheduleData, profileData] = await Promise.all([getSchedules(), getStaffProfile()]);
      setSchedules(scheduleData);
      setUser(profileData);
    } catch (error) {
      console.error('Error loading staff dashboard:', error);
      showToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const upcoming = schedules.filter((s) => ['scheduled', 'confirmed'].includes(s.status));
  const confirmed = schedules.filter((s) => s.status === 'confirmed');
  const completed = schedules.filter((s) => s.status === 'completed');

  const nextAppointment = upcoming
    .map((appointment) => ({
      ...appointment,
      dateObj: new Date(`${appointment.date} ${appointment.time_slot}`),
    }))
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  const cards = [
    {
      title: 'Upcoming',
      value: upcoming.length,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Confirmed',
      value: confirmed.length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Completed',
      value: completed.length,
      icon: ClipboardList,
      color: 'text-text-dark',
      bg: 'bg-dust-grey/60',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-app-gradient p-6 flex items-center justify-center text-text-dark">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <StaffHeader subtitle="Staff Dashboard" />
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-text-light">Welcome back</p>
          <h1 className="text-2xl font-bold text-primary-dark">{user ? `${user.first_name} ${user.last_name}`.trim() : 'Staff'}</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/staff/schedule')}
            className="px-4 py-2 bg-dust-grey rounded-xl hover:bg-primary hover:text-white transition-all"
          >
            View Schedule
          </button>
          <button
            onClick={() => navigate('/staff/profile')}
            className="px-4 py-2 bg-primary-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light">{card.title}</p>
                <h3 className="text-3xl font-bold text-text-dark">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-dark">Next Appointment</h2>
            <button
              onClick={() => navigate('/staff/schedule')}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {nextAppointment ? (
            <div className="p-4 bg-dust-grey/40 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-semibold text-text-dark">
                  {new Date(nextAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-text-light" />
                <span className="text-text-dark">{nextAppointment.time_slot}</span>
              </div>
              <p className="text-sm text-text-light">Manager: {nextAppointment.manager_email}</p>
              {nextAppointment.notes && (
                <p className="text-sm text-text-light">Notes: {nextAppointment.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-text-light">No upcoming meetings</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-text-dark mb-4">Recent Appointments</h2>
          <div className="space-y-3">
            {schedules.slice(0, 4).map((schedule) => (
              <div key={schedule.appointment_id} className="p-4 rounded-xl bg-dust-grey/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-dark">{schedule.time_slot}</p>
                  <p className="text-xs text-text-light">{schedule.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
            ))}
            {schedules.length === 0 && <p className="text-text-light">No appointments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

