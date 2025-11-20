import React, { useState, useEffect, useContext } from 'react';
import { Mail, Phone, MapPin, Calendar, UserCircle, AlertTriangle, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getStaffProfile, updateStaffProfile } from '../../services/api';
import { useToast } from '../../components/Toast';
import StaffHeader from '../../components/Staff/Header';

const StaffProfile = () => {
  const { user: contextUser } = useContext(AuthContext);
  const [user, setUser] = useState(contextUser);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getStaffProfile();
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      showToast('Failed to load profile', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      await updateStaffProfile(payload);
      showToast('Profile updated', 'success');
      setEditing(false);
      loadUser();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <StaffHeader subtitle="Staff Profile" />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate('/staff/schedule')}
          className="px-4 py-2 text-text-light hover:bg-dust-grey hover:text-primary-dark rounded-lg transition-all bg-white shadow-md border border-gray-100"
        >
          Back to Schedule
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-dark">Profile</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-primary-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(user);
                  }}
                  className="px-4 py-2 text-text-light hover:text-text-dark"
                >
                  Cancel
                </button>
              )}
            </div>

            {user && (
              <>
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl font-bold text-primary">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-text-dark">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-text-light capitalize">{user.role}</p>
                    <p className="text-xs text-text-light">{user.email}</p>
                  </div>
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">Mobile</label>
                        <input
                          type="text"
                          name="mobile"
                          value={formData.mobile || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-2">Sex</label>
                        <select
                          name="sex"
                          value={formData.sex || ''}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                        >
                          <option value="">Select</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Allergies</label>
                      <textarea
                        name="allergies"
                        value={formData.allergies || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="List allergens separated by commas"
                        className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                      <p className="text-xs text-text-light mt-1">We’ll warn you when menu items contain these ingredients.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Availability</label>
                      <textarea
                        name="availability"
                        value={formData.availability || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="ex: Weekdays 8a-4p, Sat events OK"
                        className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                      <p className="text-xs text-text-light mt-1">
                        Share any recurring windows or blackout dates so admins can schedule accurately.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Change Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-primary-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors">
                      <Mail className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Email</p>
                        <p className="font-semibold text-text-dark">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors">
                      <Phone className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Mobile</p>
                        <p className="font-semibold text-text-dark">{user.mobile || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors">
                      <MapPin className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Address</p>
                        <p className="font-semibold text-text-dark">{user.address || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors">
                      <Calendar className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Date of Birth</p>
                        <p className="font-semibold text-text-dark">
                          {user.dob ? new Date(user.dob).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors">
                      <UserCircle className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Sex</p>
                        <p className="font-semibold text-text-dark">{user.sex || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-red-500">Allergies</p>
                        <p className="font-semibold text-text-dark">
                          {user.allergies?.trim() ? user.allergies : 'None provided'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dust-grey/30 rounded-xl hover:bg-dust-grey/50 transition-colors md:col-span-2">
                      <StickyNote className="w-5 h-5 text-text-light" />
                      <div>
                        <p className="text-sm text-text-light">Availability</p>
                        <p className="font-semibold text-text-dark">
                          {user.availability?.trim() ? user.availability : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
      </div>
    </div>
  );
};

export default StaffProfile;
