import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { DownloadCloud, BarChart3 } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config';

export default function ManagerHistory() {
  const { user } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState({
    dailyData: [],
    dailyCount: 0,
    monthlyCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_URL}/transactions/manager/analytics`, config);
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(analytics.dailyData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Analytics");
      XLSX.writeFile(wb, `CampusPayX_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="text-xl font-medium text-gray-500 animate-pulse">Loading Analytics...</span></div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans bg-[#F8F9FD] min-h-screen">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[40px] font-extrabold text-[#1F2937] tracking-tight">Analytics Overview</h1>
        <p className="text-[#6B7280] mt-1 text-lg font-medium">Detailed insight into campus venue consumption and credit flow.</p>
      </div>

      {/* Main Graph Card */}
      <div className="bg-[#EEF2F6] rounded-[2rem] p-8 mb-10 shadow-sm border border-white/60">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Total Daily Coupon Usage Trends</h2>
            <p className="text-[#6B7280] text-sm mt-1">Real-time total coupon consumption trends</p>
          </div>
          <div className="flex bg-[#E2E8F0] rounded-full p-1 border border-white">
            <button className="bg-white text-[#4B5563] text-xs font-bold px-5 py-1.5 rounded-full shadow-sm tracking-wide">DAILY</button>
          </div>
        </div>

        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.dailyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12}} 
                dy={10}
                tickFormatter={(val) => {
                  if(!val) return '';
                  const d = new Date(val);
                  return d.getDate() % 5 === 0 ? `${d.getDate()} ${d.toLocaleString('en', {month: 'short'})}` : '';
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12}} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
              />
              <Line 
                type="monotone" 
                dataKey="coupons" 
                stroke="#3730A3" 
                strokeWidth={4} 
                dot={{r: 4, fill: '#3730A3', stroke: '#fff', strokeWidth: 2}}
                activeDot={{r: 8, fill: '#3730A3', stroke: '#fff', strokeWidth: 3}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Metrics Section */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col pt-10">
        
        <div className="flex justify-between items-end mb-10 w-full px-2">
          <div>
            <h3 className="text-2xl font-bold text-[#1F2937]">Daily Activity Records</h3>
            <p className="text-[#6B7280] text-sm mt-1">Timestamp: {new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 bg-[#425571] hover:bg-[#2d3a4f] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition"
          >
            <DownloadCloud className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#E4E9FA] rounded-2xl p-6 relative overflow-hidden shadow-sm">
             <h4 className="text-indigo-900/60 text-xs font-bold tracking-widest uppercase mb-4">Total Daily Count</h4>
             <div className="text-[44px] font-black text-[#1E1B4B] leading-none mb-2">
               {formatCurrency(analytics.dailyCount)}
             </div>
             <div className="absolute right-4 bottom-4 bg-[#CFD6F4] p-3 rounded-xl">
               <BarChart3 className="w-6 h-6 text-indigo-700" />
             </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#425571] rounded-2xl p-6 relative overflow-hidden shadow-lg text-white">
             <div className="absolute right-[-10px] bottom-[-20px] opacity-10">
               <BarChart3 className="w-32 h-32" />
             </div>
             <h4 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Monthly Statistics</h4>
             <div className="text-[44px] font-black leading-none mb-3">
               {formatCurrency(analytics.monthlyCount)}
             </div>
             <div className="flex items-center text-sm font-medium text-white/80">
               <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-2 py-0.5 rounded-md mr-2">+14.2%</span>
               vs last month
             </div>
          </div>

        </div>
      </div>

    </div>
  );
}
