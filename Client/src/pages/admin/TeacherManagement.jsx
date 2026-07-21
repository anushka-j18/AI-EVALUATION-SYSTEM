/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, Upload, Download } from 'lucide-react';
import api from '../../api/axiosConfig';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', employeeId: '', phone: '',
    collegeName: '', designation: '', accountNumber: '', ifscCode: '', panel: '', subjectCode: ''
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

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,department,phone,collegeName,designation,subjectCode\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const adminToken = localStorage.getItem("adminToken");
      const res = await api.post('/admin/teachers/bulk-upload', formData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(res.data.message);
      if (res.data.createdTeachers && res.data.createdTeachers.length > 0) {
        setGeneratedCredentials(res.data.createdTeachers);
      }
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert('Failed to upload CSV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadCredentials = () => {
    if (generatedCredentials.length === 0) return;
    const csvRows = ["Teacher Name,Email,Password"];
    generatedCredentials.forEach(cred => {
      csvRows.push(`${cred.name},${cred.email},${cred.password}`);
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "generated_credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        panel: teacher.panel || '',
        subjectCode: teacher.subjectCode || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', email: '', password: '', department: '', employeeId: '', phone: '',
        collegeName: '', designation: '', accountNumber: '', ifscCode: '', panel: '', subjectCode: ''
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
        const res = await api.post('/admin/teachers', formData, config);
        alert('Teacher created successfully');
        if (res.data.rawPassword) {
          setGeneratedCredentials([{ name: formData.name, email: formData.email, password: res.data.rawPassword }]);
        }
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
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Teacher Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all teachers and their details</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {generatedCredentials.length > 0 && (
            <button 
              onClick={downloadCredentials}
              className="bg-[#f1f5f9] text-green-600 px-5 py-3 rounded-[1.5rem] font-bold flex items-center gap-2 transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
            >
              <Download size={20} /> Download Credentials
            </button>
          )}
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-[#f1f5f9] text-slate-700 px-5 py-3 rounded-[1.5rem] font-bold flex items-center gap-2 transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />} 
            Bulk Upload
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-[#f1f5f9] text-blue-600 px-5 py-3 rounded-[1.5rem] font-bold flex items-center gap-2 transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]"
          >
            <Plus size={20} /> Add Teacher
          </button>
        </div>
      </div>

      <div className="bg-[#f1f5f9] rounded-[2rem] border border-white/80 overflow-hidden shadow-[10px_10px_20px_#cbd5e1,-10px_-10px_20px_#ffffff]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white/40 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-white/60">
              <tr>
                <th className="px-6 py-5">Name & Contact</th>
                <th className="px-6 py-5">Professional Details</th>
                <th className="px-6 py-5">Assignments</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {teachers.map(teacher => (
                <tr key={teacher._id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-base">{teacher.name}</div>
                    <div className="text-xs text-blue-600 font-bold font-mono mt-1">{teacher.employeeId || 'NO-ID'}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-medium text-slate-700">{teacher.collegeName || '-'}</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">{teacher.department || '-'}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">{teacher.designation || '-'}</div>
                  </td>
                  <td className="px-6 py-5 flex flex-col gap-2 items-start">
                    <span className="bg-[#f1f5f9] text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff]">
                      Panel: {teacher.panel || 'Unassigned'}
                    </span>
                    <span className="bg-[#f1f5f9] text-purple-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-[inset_2px_2px_5px_#cbd5e1,inset_-2px_-2px_5px_#ffffff]">
                      Subject: {teacher.subjectCode || 'None'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-4">
                      <button onClick={() => openModal(teacher)} className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-blue-600 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(teacher._id)} className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-red-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#f1f5f9] rounded-[2.5rem] w-full max-w-2xl border border-white/80 shadow-[20px_20px_40px_rgba(203,213,225,0.5),-20px_-20px_40px_rgba(255,255,255,1)] my-8">
            <div className="flex justify-between items-center p-6 px-8 border-b border-white/60">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
              <button onClick={closeModal} className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-slate-500 hover:text-red-500 shadow-[4px_4px_8px_#cbd5e1,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff] transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Details */}
                <div className="space-y-4 md:col-span-2 border-b border-white/60 pb-6">
                  <h3 className="text-blue-600 text-sm font-black uppercase tracking-wider">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    {editingId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Password (Leave blank to keep unchanged)</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} minLength={6} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4 md:col-span-2 border-b border-white/60 pb-6 mt-2">
                  <h3 className="text-purple-600 text-sm font-black uppercase tracking-wider">Professional & Panel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">College Name</label>
                      <input type="text" name="collegeName" value={formData.collegeName} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Department</label>
                      <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Panel</label>
                      <input type="text" name="panel" value={formData.panel} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" placeholder="e.g. Panel A, Senior Reviewers" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Subject Code(s)</label>
                      <input type="text" name="subjectCode" value={formData.subjectCode} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" placeholder="e.g. CS101, IT201" />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-4 md:col-span-2 mt-2">
                  <h3 className="text-green-600 text-sm font-black uppercase tracking-wider">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Account Number</label>
                      <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">IFSC Code</label>
                      <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className="w-full bg-[#f1f5f9] border border-white/60 rounded-xl p-3 text-slate-800 focus:outline-none shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] placeholder-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-5">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-[1.5rem] text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-[#f1f5f9] text-blue-600 px-8 py-3 rounded-[1.5rem] font-black transition-all shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Save Changes' : 'Create Teacher')}
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
