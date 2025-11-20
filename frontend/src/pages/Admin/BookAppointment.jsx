import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Check, MapPin, Briefcase, AlertTriangle, StickyNote, Loader2, Phone } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getStaffList, getTimeSlots, createAppointment, checkScheduleConflicts } from '../../services/api';
import { useToast } from '../../components/Toast';

const BookAppointment = () => {
  const [staff, setStaff] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('Main Truck');
  const [shiftType, setShiftType] = useState('Prep Shift');
  const [priority, setPriority] = useState('normal');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const shiftTypeOptions = [
    'Prep Shift',
    'Lunch Service',
    'Dinner Service',
    'Event / Catering',
    'Inventory & Restock',
  ];

  const priorityOptions = ['low', 'normal', 'high', 'critical'];

  const slotToTime = (slot) => {
    if (!slot) return '';
    const [time, meridiem] = slot.split(' ');
    if (!time || !meridiem) return '';
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (meridiem.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minutes || '00'}`;
  };

  const formatConflictWindow = (conflict) => {
    if (conflict.start_time && conflict.end_time) {
      const start = new Date(conflict.start_time);
      const end = new Date(conflict.end_time);
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return conflict.time_slot || 'Time TBD';
  };

  const updateTimesFromSlot = (slot) => {
    const base = slotToTime(slot);
    setStartTime(base);
    if (base) {
      const [h, m] = base.split(':').map((v) => parseInt(v, 10));
      const end = new Date();
      end.setHours(h);
      end.setMinutes(m);
      end.setHours(end.getHours() + 2);
      setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    } else {
      setEndTime('');
    }
  };

  const addHoursToTime = (timeString, hours = 2) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(h)) return '';
    const end = new Date();
    end.setHours(h);
    end.setMinutes(m || 0);
    end.setSeconds(0);
    end.setMilliseconds(0);
    end.setHours(end.getHours() + hours);
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
  };

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

    const startIso = startTime ? `${selectedDate}T${startTime}:00` : null;
    const endIso = endTime ? `${selectedDate}T${endTime}:00` : null;

    setLoading(true);
    try {
      await createAppointment({
        staff_email: selectedStaff,
        date: selectedDate,
        time_slot: selectedTime,
        notes,
        location,
        shift_type: shiftType,
        priority,
        start_time: startIso,
        end_time: endIso,
      });
      showToast('Appointment booked successfully!', 'success');
      setSelectedStaff('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      setLocation('Main Truck');
      setShiftType('Prep Shift');
      setPriority('normal');
      setStartTime('');
      setEndTime('');
      setConflicts([]);
    } catch (error) {
      const apiError = error.response?.data;
      if (apiError?.conflicts) {
        setConflicts(apiError.conflicts);
      }
      showToast(apiError?.error || 'Failed to book appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedStaffMember = useMemo(
    () => staff.find((s) => s.email === selectedStaff),
    [staff, selectedStaff]
  );

  useEffect(() => {
    let ignore = false;
    const runCheck = async () => {
      if (!selectedStaff || !selectedDate || !(selectedTime || startTime)) {
        setConflicts([]);
        setCheckingConflicts(false);
        return;
      }
      const derivedStart = startTime || slotToTime(selectedTime);
      if (!derivedStart) {
        setConflicts([]);
        setCheckingConflicts(false);
        return;
      }
      const derivedEnd = endTime || addHoursToTime(derivedStart);
      if (!derivedEnd) {
        setConflicts([]);
        setCheckingConflicts(false);
        return;
      }
      const startIso = `${selectedDate}T${derivedStart}:00`;
      const endIso = `${selectedDate}T${derivedEnd}:00`;
      setCheckingConflicts(true);
      try {
        const data = await checkScheduleConflicts({
          staff_email: selectedStaff,
          date: selectedDate,
          time_slot: selectedTime,
          start_time: startIso,
          end_time: endIso,
        });
        if (!ignore) {
          setConflicts(data.conflicts || []);
        }
      } catch (err) {
        if (!ignore) {
          setConflicts([]);
        }
      } finally {
        if (!ignore) {
          setCheckingConflicts(false);
        }
      }
    };
    runCheck();
    return () => {
      ignore = true;
    };
  }, [selectedStaff, selectedDate, selectedTime, startTime, endTime]);

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

              {selectedStaffMember && (
                <div className="bg-dust-grey/20 border border-dust-grey rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-text-dark">
                    <User className="w-4 h-4 text-primary" />
                    <span>{selectedStaffMember.email}</span>
                  </div>
                  {selectedStaffMember.mobile && (
                    <div className="flex items-center gap-2 text-sm text-text-dark">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{selectedStaffMember.mobile}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-dark">
                    <StickyNote className="w-4 h-4 text-primary" />
                    <span>
                      {selectedStaffMember.availability?.trim()
                        ? `Availability: ${selectedStaffMember.availability}`
                        : 'No availability provided'}
                    </span>
                  </div>
                </div>
              )}

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
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      updateTimesFromSlot(e.target.value);
                    }}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              {(selectedStaffMember && selectedDate && (selectedTime || startTime)) && (
                <div className="space-y-3">
                  {checkingConflicts ? (
                    <div className="flex items-center gap-2 text-sm text-text-light bg-dust-grey/30 rounded-xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking overlapping shifts…
                    </div>
                  ) : conflicts.length > 0 ? (
                    <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Conflict with existing shifts</span>
                      </div>
                      <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                        {conflicts.map((conflict) => (
                          <li key={conflict.appointment_id}>
                            {conflict.date ? new Date(conflict.date).toLocaleDateString() : 'Date TBD'} •{' '}
                            {formatConflictWindow(conflict)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                      <Check className="w-4 h-4" />
                      No conflicts detected for this shift.
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Downtown Pop-Up"
                      className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Shift Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                    <select
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                    >
                      {shiftTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Priority</label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
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

