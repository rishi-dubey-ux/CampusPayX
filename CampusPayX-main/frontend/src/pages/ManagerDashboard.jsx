import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Search, Coffee, UtensilsCrossed, PlusCircle } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config';

export default function ManagerDashboard() {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [queues, setQueues] = useState({
    dairy: [],
    nonveg: [],
    extras: []
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchQueues = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_URL}/transactions/manager/queues`, config);
      
      const dairy = res.data.filter(q => q.itemCategory === 'Dairy Products');
      const nonveg = res.data.filter(q => q.itemCategory === 'Non-Veg');
      const extras = res.data.filter(q => q.itemCategory === 'Extras');
      
      setQueues({ dairy, nonveg, extras });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active queues');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchQueues();
    }
    
    // Update wait times every minute
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [user?.token]);

  useEffect(() => {
    if (socket) {
      socket.on('queueUpdate', () => {
        fetchQueues();
      });
    }
    return () => {
      if (socket) socket.off('queueUpdate');
    };
  }, [socket]);

  const handleServe = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:4005/api/transactions/manager/serve/${orderId}`, {}, config);
      toast.success('Order Served!');
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to serve order');
    }
  };

  const handleReject = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:4005/api/transactions/manager/reject/${orderId}`, {}, config);
      toast.success('Order Rejected and Refunded!');
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject order');
    }
  };

  const getWaitTime = (createdAt) => {
    const diff = Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
    return diff > 0 ? `${diff}m` : '<1m';
  };

  const QueueColumn = ({ title, items, icon: Icon }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <span className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs">
          {items.length} PENDING
        </span>
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-8 font-medium">No pending orders</p>
        ) : (
          items.map((item, index) => (
            <div key={item._id} className="border-2 border-orange-700/80 rounded-2xl p-5 relative bg-white shadow-sm hover:shadow-md transition">
               {index === 0 && (
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-orange-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-lg rounded-tr-lg tracking-wider">
                  FIFO #001
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.sender?.name || 'Student'}</h3>
                  <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase">ROLL: {item.sender?.rollNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Wait Time</p>
                  <p className="text-sm font-bold text-orange-700">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({getWaitTime(item.createdAt)})
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                TOKEN #{item.tokenNumber}
              </div>

              <div className="bg-indigo-50/50 rounded-xl p-3 flex justify-between items-center mb-5">
                <span className="font-semibold text-indigo-900 text-sm">{item.itemName}</span>
                <span className="bg-white text-indigo-700 text-xs font-bold px-2 py-1 rounded border border-indigo-100">
                  QTY: {String(item.quantity).padStart(2, '0')}
                </span>
              </div>

              <div className="flex space-x-3 mt-auto">
                <button 
                  onClick={() => handleServe(item._id)}
                  className="flex-1 bg-[#415a77] hover:bg-[#2e4156] text-white font-medium py-2 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <span className="text-sm">✔ Serve</span>
                </button>
                <button 
                  onClick={() => handleReject(item._id)}
                  className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 font-medium py-2 rounded-xl transition text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-[#f7f8fc] min-h-screen">
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#233142] tracking-tight">Manager Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">Real-time order processing & kitchen throughput</p>
        </div>
        <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
           <div className="flex items-center space-x-2">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-[#233142] uppercase tracking-wider">Live: Main Mess Hall</span>
           </div>
           <div className="h-4 w-px bg-gray-300"></div>
           <span className="text-xs font-medium text-gray-500">
             Active Orders: {queues.dairy.length + queues.nonveg.length + queues.extras.length}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[750px]">
        <QueueColumn title="Dairy Products" items={queues.dairy} icon={Coffee} />
        <QueueColumn title="Non-Veg" items={queues.nonveg} icon={UtensilsCrossed} />
        <QueueColumn title="Extras" items={queues.extras} icon={PlusCircle} />
      </div>
    </div>
  );
}
