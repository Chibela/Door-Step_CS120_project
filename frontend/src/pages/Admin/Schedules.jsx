import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, RefreshCcw } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getSchedules, updateAppointment } from '../../services/api';
import { useToast } from '../../components/Toast';

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState('');
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

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      schedule.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.staff_email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
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
                <p className="text-sm text-text-light mt-1">{filteredSchedules.length} appointment{filteredSchedules.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
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
                    <div key={schedule.appointment_id} className="bg-dust-grey/30 rounded-xl p-6 border-l-4 border-primary hover:bg-dust-grey/50 transition-colors">
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
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-text-light">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(schedule.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-light">
                            <Clock className="w-5 h-5" />
                            <span>{schedule.time_slot}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                      {schedule.notes && (
                        <p className="text-sm text-text-light mt-3">{schedule.notes}</p>
                      )}
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-text-light mb-1">
                          Update Status
                        </label>
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

