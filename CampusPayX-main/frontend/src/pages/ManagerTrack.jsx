import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Search, Loader2, User, CreditCard, CalendarDays, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, SOCKET_URL } from '../config';

export default function ManagerTrack() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.rollNumber.trim()) {
      toast.error('Please enter either a name or a roll number.');
      return;
    }
    
    setLoading(true);
    setStudentData(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_URL}/transactions/manager/track-student`, formData, config);
      setStudentData(res.data);
      toast.success('Student identified successfully!');
    } catch (err) {
      if(err.response?.status === 404) {
        toast.error('No student found with those details.');
      } else {
        toast.error('Failed to locate student data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatMonthName = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans bg-[#FAFBFF] min-h-[calc(100vh-64px)]flex flex-col items-center">
      
      {/* Hero Section */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700 w-full mt-10">
        <h1 className="text-[52px] font-extrabold text-[#233142] tracking-tight mb-2">
          Locate. Monitor. <span className="text-[#4F688B] italic">Verify.</span>
        </h1>
        <p className="text-[#64748B] text-lg font-medium">
          Streamlined student identification and transaction tracking for campus administrators.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-[#EEF1FB] rounded-[2rem] p-8 md:p-10 shadow-sm w-full max-w-4xl mx-auto mb-16 relative overflow-hidden border border-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <form onSubmit={handleSearch} className="relative z-10 flex flex-col items-center">
          <div className="flex flex-col md:flex-row gap-6 w-full mb-8">
            
            {/* Name Input */}
            <div className="flex-1">
              <label className="text-xs font-bold text-[#4B5563] ml-2 mb-2 block tracking-wider">Search by Student Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. Alexander Pierce"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#E0E7FF]/60 text-[#1E293B] font-medium rounded-2xl py-4 pl-12 pr-4 border border-transparent focus:outline-none focus:border-indigo-200 focus:bg-[#E0E7FF] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

            {/* Roll Number Input */}
            <div className="flex-1">
              <label className="text-xs font-bold text-[#4B5563] ml-2 mb-2 block tracking-wider">Search by Roll Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input 
                  type="text" 
                  name="rollNumber"
                  placeholder="e.g. 2024-ENG-042"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full bg-[#E0E7FF]/60 text-[#1E293B] font-medium rounded-2xl py-4 pl-12 pr-4 border border-transparent focus:outline-none focus:border-indigo-200 focus:bg-[#E0E7FF] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-[#94A3B8]"
                />
              </div>
            </div>

          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#3B4C6A] hover:bg-[#2C3951] text-white font-semibold py-4 px-10 rounded-2xl transition shadow-[0_8px_16px_rgba(59,76,106,0.2)] hover:shadow-[0_12px_24px_rgba(59,76,106,0.3)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Identify Student
          </button>
        </form>
      </div>

      {/* Results Section */}
      {studentData && (
        <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Identity Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
               <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center border-4 border-indigo-100">
                  <User className="w-8 h-8 text-indigo-600" />
               </div>
               <div>
                 <h2 className="text-3xl font-bold text-gray-900 leading-tight">{studentData.student.name}</h2>
                 <p className="text-gray-500 font-semibold mt-1 tracking-wide uppercase">{studentData.student.rollNumber}</p>
               </div>
            </div>
            <div className="text-right bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Current Balance</p>
              <p className="text-2xl font-black text-emerald-600">{formatCurrency(studentData.student.balance)}</p>
            </div>
          </div>

          {/* Month-wise Data Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Amount Spent Column */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-50 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                 <div className="bg-red-100 p-2 rounded-xl text-red-600"><Wallet className="w-5 h-5" /></div>
                 <h3 className="text-xl font-bold text-gray-800">Total Spent Tracker</h3>
               </div>
               
               {studentData.monthlySpent.length === 0 ? (
                 <p className="text-gray-400 text-center py-8 font-medium">No spending records found.</p>
               ) : (
                 <div className="space-y-4">
                   {studentData.monthlySpent.map((entry, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-[#FAFAF9] p-4 rounded-2xl border border-gray-100">
                       <div className="flex items-center gap-3">
                         <CalendarDays className="w-4 h-4 text-gray-400" />
                         <span className="font-semibold text-gray-700">{formatMonthName(entry.month)}</span>
                       </div>
                       <span className="font-black text-red-600">-{formatCurrency(entry.amount)}</span>
                     </div>
                   ))}
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-red-50 border border-red-100 mt-6 !mt-8">
                     <span className="font-bold text-red-900">Total-ALL</span>
                     <span className="font-black text-red-700">
                       {formatCurrency(studentData.monthlySpent.reduce((sum, e) => sum + e.amount, 0))}
                     </span>
                   </div>
                 </div>
               )}
            </div>

            {/* Topups Added Column */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-50 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                 <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><CreditCard className="w-5 h-5" /></div>
                 <h3 className="text-xl font-bold text-gray-800">Top-up Used Monthly</h3>
               </div>
               
               {studentData.monthlyTopups.length === 0 ? (
                 <p className="text-gray-400 text-center py-8 font-medium">No top-up records found.</p>
               ) : (
                 <div className="space-y-4">
                   {studentData.monthlyTopups.map((entry, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-[#FAFAF9] p-4 rounded-2xl border border-gray-100">
                       <div className="flex items-center gap-3">
                         <CalendarDays className="w-4 h-4 text-gray-400" />
                         <span className="font-semibold text-gray-700">{formatMonthName(entry.month)}</span>
                       </div>
                       <span className="font-black text-emerald-600">+{formatCurrency(entry.amount)}</span>
                     </div>
                   ))}
                   <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 mt-6 !mt-8">
                     <span className="font-bold text-emerald-900">Total-ALL</span>
                     <span className="font-black text-emerald-700">
                       {formatCurrency(studentData.monthlyTopups.reduce((sum, e) => sum + e.amount, 0))}
                     </span>
                   </div>
                 </div>
               )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
