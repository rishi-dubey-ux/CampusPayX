import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL, SOCKET_URL } from '../config';

export default function Track() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const histRes = await axios.get(`${API_URL}/transactions/history`, config);
      setHistory(histRes.data);
      setLoading(false);
    } catch (error) {
      console.error("AXIOS ERROR DETAILS:", error);
      toast.error('Failed to fetch tracking data: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token]);

  // Aggregation logic
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });

  // Filter for payments and outgoing transfers in the current month
  const monthPayments = history.filter(tx => {
    const isPayment = tx.type === 'payment';
    const isOutgoingTransfer = tx.type === 'transfer' && (tx.sender?._id === user._id || tx.sender === user._id);
    
    if (!isPayment && !isOutgoingTransfer) return false;

    const txDate = new Date(tx.createdAt);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalMonthlySpend = monthPayments.reduce((sum, tx) => sum + tx.amount, 0);

  // Daily aggregation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyTotals = Array(daysInMonth).fill(0);
  
  monthPayments.forEach(tx => {
    const day = new Date(tx.createdAt).getDate();
    dailyTotals[day - 1] += tx.amount;
  });

  const maxDaily = Math.max(...dailyTotals, 1); // prevent division by zero

  // Category aggregation
  const categories = {
    'Meals': 0, // Maps to Non-Veg
    'Dairy (Lassi/Curd)': 0, // Maps to Dairy Products
    'Snacks': 0, // Maps to Extras or others
    'Transfers': 0 // Outgoing P2P transfers
  };

  monthPayments.forEach(tx => {
    if (tx.type === 'transfer') {
      categories['Transfers'] += tx.amount;
    } else {
      if (tx.venue === 'Non-Veg') categories['Meals'] += tx.amount;
      else if (tx.venue === 'Dairy Products') categories['Dairy (Lassi/Curd)'] += tx.amount;
      else if (tx.venue === 'Extras') categories['Snacks'] += tx.amount;
      else categories['Snacks'] += tx.amount; // fallback
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#10b981] uppercase mb-2">Insights & Trends</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827]">
            {currentMonthName} <span className="font-light text-gray-400 italic font-serif tracking-wide">Spending</span>
          </h1>
        </div>
        
        <div className="mt-6 md:mt-0 bg-[#f8fafc] rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Total</p>
          <p className="text-3xl font-extrabold text-[#1f2937]">₹{totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="h-80 bg-white rounded-3xl"></div>
          <div className="h-64 bg-indigo-50 rounded-3xl"></div>
        </div>
      ) : (
        <>
          {/* Spend Trend Chart */}
          <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">Spend Trend</h2>
                <p className="text-xs text-gray-400 font-medium">Daily velocity for the current month</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                Trending well
              </div>
            </div>

            <div className="relative h-48 flex items-end justify-between px-2 gap-1 md:gap-2">
              {dailyTotals.map((total, index) => {
                const heightPercent = total === 0 ? 5 : (total / maxDaily) * 100;
                const isHighlight = total > (maxDaily * 0.7); // Highlight very high relative spending
                
                return (
                  <div key={index} className="flex flex-col items-center w-full group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                      ₹{total}
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className={`w-full max-w-[12px] md:max-w-[16px] rounded-t-lg transition-all duration-500 hover:opacity-80 ${isHighlight ? 'bg-[#3b4c61]' : 'bg-[#e0e7ff]'}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest px-2">
              <span>{currentMonthName.substring(0,3)} 01</span>
              <span>{currentMonthName.substring(0,3)} 15</span>
              <span>Today</span>
            </div>
          </div>

          {/* Category Split */}
          <div className="bg-[#eef2ff] rounded-3xl p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-8">Category Split</h2>
            
            <div className="space-y-6">
              {/* Category: Meals */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Meals</span>
                  <span>{totalMonthlySpend > 0 ? Math.round((categories['Meals'] / totalMonthlySpend) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-[#dbeafe] rounded-full h-2">
                  <div 
                    className="bg-[#3b4c61] h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalMonthlySpend > 0 ? (categories['Meals'] / totalMonthlySpend) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Category: Dairy */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Dairy (Lassi/Curd)</span>
                  <span>{totalMonthlySpend > 0 ? Math.round((categories['Dairy (Lassi/Curd)'] / totalMonthlySpend) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-[#ccfbf1] rounded-full h-2">
                  <div 
                    className="bg-[#0f766e] h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalMonthlySpend > 0 ? (categories['Dairy (Lassi/Curd)'] / totalMonthlySpend) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Category: Snacks */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>Snacks</span>
                  <span>{totalMonthlySpend > 0 ? Math.round((categories['Snacks'] / totalMonthlySpend) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-[#ffedd5] rounded-full h-2">
                  <div 
                    className="bg-[#f97316] h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalMonthlySpend > 0 ? (categories['Snacks'] / totalMonthlySpend) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Category: Transfers */}
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                  <span>P2P Transfers</span>
                  <span>{totalMonthlySpend > 0 ? Math.round((categories['Transfers'] / totalMonthlySpend) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${totalMonthlySpend > 0 ? (categories['Transfers'] / totalMonthlySpend) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
