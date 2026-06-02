import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import api from '../../api/axiosConfig';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', employeeId: '', phone: '',
    collegeName: '', designation: '', accountNumber: '', ifscCode: '', panel: ''
  });

  const fetchTeachers = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await api.get('/admin/teachers', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setTeachers(res.data.teachers);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch teachers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (teacher = null) => {
    if (teacher) {
      setEditingId(teacher._id);
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        password: '', 
        department: teacher.department || '',
        employeeId: teacher.employeeId || '',
        phone: teacher.phone || '',
        collegeName: teacher.collegeName || '',
        designation: teacher.designation || '',
        accountNumber: teacher.accountNumber || '',
        ifscCode: teacher.ifscCode || '',
        panel: teacher.panel || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', password: '', department: '', employeeId: '', phone: '',
        collegeName: '', designation: '', accountNumber: '', ifscCode: '', panel: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const adminToken = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${adminToken}` } };

      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, formData, config);
        alert('Teacher updated successfully');
      } else {
        if (!formData.password) {
          alert("Password is required for new teachers");
          setIsSubmitting(false);
          return;
        }
        await api.post('/admin/teachers', formData, config);
        alert('Teacher created successfully');
      }
      closeModal();
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const adminToken = localStorage.getItem("adminToken");
        await api.delete(`/admin/teachers/${id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        alert('Teacher deleted successfully');
        fetchTeachers();
      } catch (err) {
        console.error(err);
        alert('Failed to delete teacher');
      }
    }
  };

  if (isLoading) return <div className="text-white p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Management</h1>
          <p className="text-gray-400 mt-1">Manage all teachers and their details</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add Teacher
        </button>
      </div>

      <div className="bg-[#0f172a] rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-800 text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">College / Dept</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Panel</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {teachers.map(teacher => (
                <tr key={teacher._id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{teacher.collegeName || '-'}</div>
                    <div className="text-xs text-gray-500">{teacher.department || '-'}</div>
                  </td>
                  <td className="px-6 py-4">{teacher.designation || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md text-xs border border-cyan-500/20">
                      {teacher.panel || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button onClick={() => openModal(teacher)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(teacher._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Details */}
                <div className="space-y-4 md:col-span-2 border-b border-slate-700 pb-4">
                  <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Password {editingId && '(Leave blank to keep unchanged)'}</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingId} minLength={6} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4 md:col-span-2 border-b border-slate-700 pb-4 mt-2">
                  <h3 className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Professional & Panel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">College Name</label>
                      <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                      <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Panel</label>
                      <input type="text" name="panel" value={formData.panel} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" placeholder="e.g. Panel A, Senior Reviewers" />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4 md:col-span-2 mt-2">
                  <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wider">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Account Number</label>
                      <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">IFSC Code</label>
                      <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? 'Save Changes' : 'Create Teacher')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
