import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, ClipboardCheck, AlertCircle, MapPin, Briefcase, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getSchedules, updateAppointment, getTimeSlots, requestShift } from '../../services/api';
import { useToast } from '../../components/Toast';
import StaffHeader from '../../components/Staff/Header';

const StaffSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    date: '',
    time_slot: '',
    location: '',
    shift_type: 'Prep Shift',
    notes: '',
  });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    loadSchedules();
    loadTimeSlots();
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

  const loadTimeSlots = async () => {
    try {
      const slots = await getTimeSlots();
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitShiftRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.date || !requestForm.time_slot) {
      showToast('Select a date and time slot before submitting.', 'warning');
      return;
    }
    setRequesting(true);
    try {
      await requestShift({
        date: requestForm.date,
        time_slot: requestForm.time_slot,
        location: requestForm.location || 'Main Truck',
        shift_type: requestForm.shift_type,
        notes: requestForm.notes,
      });
      showToast('Shift request sent for approval', 'success');
      setRequestForm({
        date: '',
        time_slot: '',
        location: '',
        shift_type: 'Prep Shift',
        notes: '',
      });
      loadSchedules();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to submit request', 'error');
    } finally {
      setRequesting(false);
    }
  };

  const convertToDateObj = (schedule) => {
    if (schedule.start_time) {
      const parsed = new Date(schedule.start_time);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
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
  const pendingCount = schedules.filter((s) => ['scheduled', 'requested'].includes(s.status)).length;
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
      detail: 'Scheduled or awaiting approval',
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

  const actionableStatuses = ['scheduled', 'confirmed'];

  const actionItems = upcomingSchedules.slice(0, 3);

  const formatShiftMeta = (schedule) => {
    const pieces = [];
    if (schedule.location) pieces.push(schedule.location);
    if (schedule.shift_type) pieces.push(schedule.shift_type);
    if (schedule.start_time && schedule.end_time) {
      const start = new Date(schedule.start_time);
      const end = new Date(schedule.end_time);
      pieces.push(
        `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      );
    } else if (schedule.time_slot) {
      pieces.push(schedule.time_slot);
    }
    return pieces.join(' • ');
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <StaffHeader subtitle="Staff Schedule" />

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
            <div>
              <h2 className="text-xl font-bold text-text-dark">Request a Shift</h2>
              <p className="text-sm text-text-light">Tell dispatch when you’re available</p>
            </div>
          </div>
          <form onSubmit={submitShiftRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Preferred Date</label>
              <input
                type="date"
                name="date"
                value={requestForm.date}
                onChange={handleRequestChange}
                className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Time Slot</label>
              <select
                name="time_slot"
                value={requestForm.time_slot}
                onChange={handleRequestChange}
                className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                required
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Shift Type</label>
              <select
                name="shift_type"
                value={requestForm.shift_type}
                onChange={handleRequestChange}
                className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
              >
                {['Prep Shift', 'Lunch Service', 'Dinner Service', 'Event / Catering', 'Inventory & Restock'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Preferred Location</label>
              <input
                type="text"
                name="location"
                value={requestForm.location}
                onChange={handleRequestChange}
                placeholder="e.g., Downtown truck, Catering"
                className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-light mb-2">
                Notes for Dispatch (optional)
              </label>
              <textarea
                name="notes"
                value={requestForm.notes}
                onChange={handleRequestChange}
                rows={3}
                placeholder="Let us know if you’re covering someone, special availability, etc."
                className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={requesting}
                className="flex items-center gap-2 px-6 py-2 bg-primary-gradient text-white rounded-xl shadow hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {requesting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
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
                    <p className="font-semibold text-text-dark">{formatShiftMeta(schedule)}</p>
                    <p className="text-xs text-text-light">
                      {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'}
                    </p>
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
                          <div className="space-y-1">
                            <p className="font-semibold text-text-dark">{formatShiftMeta(schedule)}</p>
                            <p className="text-sm text-text-light">Manager: {schedule.manager_email}</p>
                            {schedule.location && (
                              <p className="text-xs text-text-light flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {schedule.location}
                              </p>
                            )}
                            {schedule.shift_type && (
                              <p className="text-xs text-text-light flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {schedule.shift_type}
                              </p>
                            )}
                            {schedule.notes && (
                              <p className="text-xs text-text-light">Notes: {schedule.notes}</p>
                            )}
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              schedule.status === 'requested'
                                ? 'bg-purple-100 text-purple-700'
                                : schedule.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : schedule.status === 'completed'
                                ? 'bg-primary/10 text-primary-dark'
                                : schedule.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : schedule.status === 'denied'
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </div>
                        {schedule.status === 'requested' ? (
                          <p className="text-xs text-text-light">
                            Awaiting manager approval. You can cancel through dispatch if needed.
                          </p>
                        ) : actionableStatuses.includes(schedule.status) ? (
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
                        ) : null}
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
