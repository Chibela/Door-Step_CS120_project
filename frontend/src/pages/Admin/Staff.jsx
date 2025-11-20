import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, MapPin, Calendar, AlertTriangle, StickyNote } from 'lucide-react';
import Header from '../../components/Admin/Header';
import Sidebar from '../../components/Admin/Sidebar';
import { getStaffList, createStaff, updateStaff } from '../../services/api';
import { useToast } from '../../components/Toast';

const initialFormState = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  mobile: '',
  address: '',
  dob: '',
  sex: '',
  allergies: '',
  availability: '',
};

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await getStaffList();
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
      showToast('Failed to load staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (staffMember = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({ ...staffMember, password: '' });
    } else {
      setEditingStaff(null);
      setFormData(initialFormState);
    }
    setFormErrors({});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData(initialFormState);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (isEditing) => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    if (!isEditing && !formData.password.trim()) {
      errors.password = 'Temporary password is required when creating staff.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(Boolean(editingStaff));
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      showToast('Please fix the highlighted fields.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData };
      if (editingStaff) {
        if (!payload.password) {
          delete payload.password;
        }
      } else if (!payload.password) {
        showToast('Password is required when creating a new staff member', 'warning');
        return;
      }
      if (editingStaff) {
        await updateStaff(editingStaff.email, payload);
        showToast('Staff updated successfully', 'success');
      } else {
        await createStaff(payload);
        showToast('Staff added successfully', 'success');
      }
      handleCloseForm();
      loadStaff();
    } catch (error) {
      showToast(error.response?.data?.error || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = staff.filter((member) => {
    if (!searchTerm) return true;
    return (
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-app-gradient p-6">
      <Header />
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-dark">Staff Directory</h2>
                <p className="text-sm text-text-light mt-1">{filteredStaff.length} team member{filteredStaff.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-text-dark"
                />
                <button
                  onClick={() => handleOpenForm()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-text-light">Loading staff...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-xl">
                <Users className="w-16 h-16 text-dust-grey mx-auto mb-3" />
                <p className="text-text-light">No staff found</p>
              </div>
            ) : (
              filteredStaff.map((member) => (
                <div key={member.email} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-text-dark">
                        {`${member.first_name} ${member.last_name}`.trim() || member.email}
                      </h3>
                      <p className="text-sm text-text-light capitalize">Staff</p>
                    </div>
                    <button
                      onClick={() => handleOpenForm(member)}
                      className="text-primary text-sm font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-sm text-text-light">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{member.mobile}</span>
                      </div>
                    )}
                    {member.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{member.address}</span>
                      </div>
                    )}
                    {member.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{member.dob}</span>
                      </div>
                    )}
                    {member.allergies && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-red-500">Allergies: {member.allergies}</span>
                      </div>
                    )}
                    {member.availability && (
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-primary" />
                        <span>Availability: {member.availability}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-text-dark">
                    {editingStaff ? 'Edit Staff' : 'Add Staff'}
                  </h3>
                  <button onClick={handleCloseForm} className="text-text-light hover:text-text-dark">
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 transition-all ${
                        formErrors.first_name ? 'border-red-400 focus:ring-red-200' : 'border-dust-grey focus:ring-primary focus:border-primary'
                      }`}
                      aria-invalid={Boolean(formErrors.first_name)}
                        required
                      />
                    {formErrors.first_name && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>
                    )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 transition-all ${
                        formErrors.last_name ? 'border-red-400 focus:ring-red-200' : 'border-dust-grey focus:ring-primary focus:border-primary'
                      }`}
                      aria-invalid={Boolean(formErrors.last_name)}
                        required
                      />
                    {formErrors.last_name && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>
                    )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 transition-all disabled:bg-gray-100 ${
                        formErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-dust-grey focus:ring-primary focus:border-primary'
                      }`}
                      aria-invalid={Boolean(formErrors.email)}
                        required
                        disabled={Boolean(editingStaff)}
                      />
                    {formErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                    )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">
                        {editingStaff ? 'New Password (optional)' : 'Temporary Password'}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                      className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 transition-all ${
                        formErrors.password ? 'border-red-400 focus:ring-red-200' : 'border-dust-grey focus:ring-primary focus:border-primary'
                      }`}
                      aria-invalid={Boolean(formErrors.password)}
                        placeholder={editingStaff ? 'Leave blank to keep current password' : 'Set a temporary password'}
                        required={!editingStaff}
                      />
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                    )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
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
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-light mb-2">Sex</label>
                      <select
                        name="sex"
                        value={formData.sex}
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
                    <label className="block text-sm font-medium text-text-light mb-2">Allergies (optional)</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g., shellfish, peanuts"
                      className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <p className="text-xs text-text-light mt-1">
                      Helps flag risky menu items when this staff member places an order.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">Availability (optional)</label>
                    <textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      rows={3}
                      placeholder="e.g., Weekdays 8a-4p, no Sundays"
                      className="w-full px-4 py-2 border-2 border-dust-grey rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <p className="text-xs text-text-light mt-1">Share recurring shift windows or blackout dates.</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 text-text-light hover:text-text-dark"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-primary-gradient text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingStaff ? 'Save Changes' : 'Add Staff'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStaff;

