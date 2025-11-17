import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getStaffList, getTimeSlots, createAppointment } from '../../services/api';
import { useToast } from '../../components/Toast';

const BookAppointment = () => {
  const [staff, setStaff] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffData, timeSlotsData] = await Promise.all([
        getStaffList(),
        getTimeSlots(),
      ]);
      setStaff(staffData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff || !selectedDate || !selectedTime) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        staff_email: selectedStaff,
        date: selectedDate,
        time_slot: selectedTime,
        notes,
      });
      showToast('Appointment booked successfully!', 'success');
      setSelectedStaff('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to book appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-text-dark mb-6">Book Appointment</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Select Staff
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                    required
                  >
                    <option value="">Choose staff member</option>
                    {staff.map((s) => (
                      <option key={s.email} value={s.email}>
                        {`${s.first_name} ${s.last_name}`.trim() || s.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Select Time Slot
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark bg-white"
                    required
                  >
                    <option value="">Choose time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[120px] border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark p-3"
                  placeholder="Add context or goals for this appointment"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] disabled:transform-none"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;

