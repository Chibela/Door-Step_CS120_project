import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  RefreshCcw,
  MapPin,
  Briefcase,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getSchedules, updateAppointment } from '../../services/api';
import { useToast } from '../../components/Toast';

const priorityLabels = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  critical: 'Critical',
};

const shiftOptionsDefaults = [
  'Prep Shift',
  'Lunch Service',
  'Dinner Service',
  'Event / Catering',
  'Inventory & Restock',
];

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftTypeFilter, setShiftTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({
    date: '',
    time_slot: '',
    start_time: '',
    end_time: '',
    location: '',
    shift_type: 'Prep Shift',
    priority: 'normal',
    notes: '',
  });
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
      showToast('Failed to load schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['scheduled', 'confirmed', 'completed', 'cancelled'];

  const shiftOptions = useMemo(
    () => ['all', ...new Set([...shiftOptionsDefaults, ...schedules.map((s) => s.shift_type).filter(Boolean)])],
    [schedules]
  );

  const formatTimeRange = (schedule) => {
    if (schedule.start_time && schedule.end_time) {
      const start = new Date(schedule.start_time);
      const end = new Date(schedule.end_time);
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return schedule.time_slot || 'TBD';
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesShift =
      shiftTypeFilter === 'all' ||
      (schedule.shift_type || '').toLowerCase() === shiftTypeFilter.toLowerCase();
    const matchesLocation =
      !locationFilter ||
      (schedule.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSearch =
      !searchTerm ||
      schedule.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.staff_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesShift && matchesLocation && matchesSearch;
  });

  const handleStatusChange = async (appointmentId, status) => {
    if (!status) return;
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

  const openEdit = (schedule) => {
    setEditingId(schedule.appointment_id);
    setEditForm({
      date: schedule.date || '',
      time_slot: schedule.time_slot || '',
      start_time: (schedule.start_time || '').split('T')[1]?.slice(0, 5) || '',
      end_time: (schedule.end_time || '').split('T')[1]?.slice(0, 5) || '',
      location: schedule.location || '',
      shift_type: schedule.shift_type || 'Prep Shift',
      priority: schedule.priority || 'normal',
      notes: schedule.notes || '',
    });
  };

  const closeEdit = () => {
    setEditingId('');
    setEditForm({
      date: '',
      time_slot: '',
      start_time: '',
      end_time: '',
      location: '',
      shift_type: 'Prep Shift',
      priority: 'normal',
      notes: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);
      const payload = {
        date: editForm.date,
        time_slot: editForm.time_slot,
        start_time: editForm.start_time ? `${editForm.date}T${editForm.start_time}:00` : undefined,
        end_time: editForm.end_time ? `${editForm.date}T${editForm.end_time}:00` : undefined,
        location: editForm.location,
        shift_type: editForm.shift_type,
        priority: editForm.priority,
        notes: editForm.notes,
      };
      await updateAppointment(appointmentId, payload);
      showToast('Schedule updated', 'success');
      closeEdit();
      loadSchedules();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update schedule', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-primary/10 text-primary-dark';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'scheduled':
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-dark">All Schedules</h2>
                <p className="text-sm text-text-light mt-1">
                  {filteredSchedules.length} appointment{filteredSchedules.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                >
                  <option value="all">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={shiftTypeFilter}
                  onChange={(e) => setShiftTypeFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                >
                  {shiftOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === 'all' ? 'All Shift Types' : option}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark"
                />
                <button
                  onClick={loadSchedules}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-dust-grey rounded-xl hover:bg-primary hover:text-white transition-all"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-text-dark">Loading schedules...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <div
                      key={schedule.appointment_id}
                      className="bg-dust-grey/30 rounded-xl p-6 border-l-4 border-primary hover:bg-dust-grey/50 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-dark">{schedule.staff_name}</p>
                            <p className="text-xs text-text-light">{schedule.staff_email}</p>
                            <p className="text-xs text-text-light mt-1">Assigned by: {schedule.manager_email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-6 items-center">
                          <div className="flex items-center gap-2 text-text-light">
                            <Calendar className="w-5 h-5" />
                            <span>
                              {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'Date TBD'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-text-light">
                            <Clock className="w-5 h-5" />
                            <span>{formatTimeRange(schedule)}</span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(schedule.status)}`}
                          >
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {schedule.location && (
                          <span className="px-3 py-1 bg-white rounded-full border border-gray-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {schedule.location}
                          </span>
                        )}
                        {schedule.shift_type && (
                          <span className="px-3 py-1 bg-white rounded-full border border-gray-200 flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-primary" />
                            {schedule.shift_type}
                          </span>
                        )}
                        {schedule.priority && (
                          <span className="px-3 py-1 bg-white rounded-full border border-gray-200 flex items-center gap-1 capitalize">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            {priorityLabels[schedule.priority] || schedule.priority}
                          </span>
                        )}
                      </div>
                      {schedule.notes && (
                        <p className="text-sm text-text-light mt-3">Notes: {schedule.notes}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-3 items-center">
                        <div>
                          <label className="block text-xs font-semibold text-text-light mb-1">Update Status</label>
                          <select
                            value={schedule.status}
                            disabled={updatingId === schedule.appointment_id}
                            onChange={(e) => handleStatusChange(schedule.appointment_id, e.target.value)}
                            className="px-3 py-2 border-2 border-dust-grey rounded-xl bg-white text-text-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEdit(schedule)}
                          className="px-4 py-2 bg-white rounded-xl border border-gray-200 shadow text-sm font-semibold hover:bg-primary hover:text-white transition-all"
                        >
                          Edit Shift Details
                        </button>
                      </div>
                      {editingId === schedule.appointment_id && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Date</label>
                              <input
                                type="date"
                                name="date"
                                value={editForm.date}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Time Slot (label)</label>
                              <input
                                type="text"
                                name="time_slot"
                                value={editForm.time_slot}
                                onChange={handleEditChange}
                                placeholder="e.g., 9:00 AM"
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Start Time</label>
                              <input
                                type="time"
                                name="start_time"
                                value={editForm.start_time}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">End Time</label>
                              <input
                                type="time"
                                name="end_time"
                                value={editForm.end_time}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Location</label>
                              <input
                                type="text"
                                name="location"
                                value={editForm.location}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Shift Type</label>
                              <select
                                name="shift_type"
                                value={editForm.shift_type}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg bg-white"
                              >
                                {shiftOptionsDefaults.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-text-light mb-1">Priority</label>
                              <select
                                name="priority"
                                value={editForm.priority}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border rounded-lg bg-white capitalize"
                              >
                                {Object.keys(priorityLabels).map((key) => (
                                  <option key={key} value={key}>
                                    {priorityLabels[key]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-semibold text-text-light mb-1">Notes</label>
                              <textarea
                                name="notes"
                                value={editForm.notes}
                                onChange={handleEditChange}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={closeEdit}
                              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-text-light hover:text-text-dark"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === schedule.appointment_id}
                              onClick={() => handleEditSubmit(schedule.appointment_id)}
                              className="flex items-center gap-1 px-4 py-2 bg-primary-gradient text-white rounded-xl shadow disabled:opacity-60"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-dust-grey mx-auto mb-4" />
                    <p className="text-text-light text-lg">No schedules found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedules;

