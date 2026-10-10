import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, History, ChevronDown } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config';

const venues = [
  {
    id: 'dairy',
    name: 'Dairy Products',
    dbName: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    options: [
      { name: 'Curd', price: 15 },
      { name: 'Milk', price: 20 },
      { name: 'Paneer', price: 40 }
    ],
    badge: 'POPULAR',
    badgeColor: 'bg-emerald-400',
  },
  {
    id: 'nonveg',
    name: 'Non-Veg',
    dbName: 'Non-Veg',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    options: [
      { name: 'Chicken', price: 60 },
      { name: 'Chicken Thali', price: 250 },
      { name: 'Egg', price: 15 }
    ],
    badge: "CHEF'S SPECIAL",
    badgeColor: 'bg-orange-400',
    qtyLabel: 'QUANTITY (PIECES)'
  },
  {
    id: 'extras',
    name: 'Extras',
    dbName: 'Extras',
    image: 'https://images.unsplash.com/photo-1541592102481-c3098555e0c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    options: [
      { name: 'Bread', price: 5 },
      { name: 'Lassi', price: 20 },
      { name: 'Juice', price: 30 }
    ],
    badge: null,
  }
];

export default function StudentDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [history, setHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  
  // State for venue orders
  const [orders, setOrders] = useState({
    dairy: { item: 'Curd', quantity: 1 },
    nonveg: { item: 'Chicken', quantity: 2 },
    extras: { item: 'Bread', quantity: 1 }
  });

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const meRes = await axios.get(`${API_URL}/users/me`, config);
      setBalance(meRes.data.balance);
      setUser({ ...user, balance: meRes.data.balance });
      
      const histRes = await axios.get(`${API_URL}/transactions/history`, config);
      setHistory(histRes.data);
      
      const pendRes = await axios.get(`${API_URL}/transactions/pending`, config);
      setPendingOrder(pendRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    }
  }, [user?.token]);

  useEffect(() => {
    if (socket) {
      socket.on('studentCalled', (calledStudent) => {
        if (calledStudent.rollNumber === user.rollNumber) {
          toast.success('Your food is ready! Please collect at the counter.', { duration: 5000, icon: '🥣' });
          fetchDashboardData();
        }
      });

      socket.on('orderRejected', (rejectedStudent) => {
        if (rejectedStudent.rollNumber === user.rollNumber) {
          toast.error('Your order was rejected/timed out. Amount has been refunded.');
          fetchDashboardData();
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('studentCalled');
        socket.off('orderRejected');
      }
    };
  }, [socket, user]);

  const handleTopUp = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_URL}/transactions/topup`, {}, config);
      toast.success('Successfully added 500 Credits!');
      setBalance(res.data.newBalance);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Top-up failed');
    }
  };

  const handleOrderChange = (venueId, field, value) => {
    setOrders(prev => ({
      ...prev,
      [venueId]: {
        ...prev[venueId],
        [field]: value
      }
    }));
  };

  const incrementQty = (venueId) => {
    setOrders(prev => ({
      ...prev,
      [venueId]: { ...prev[venueId], quantity: prev[venueId].quantity + 1 }
    }));
  };

  const decrementQty = (venueId) => {
    setOrders(prev => ({
      ...prev,
      [venueId]: { ...prev[venueId], quantity: Math.max(1, prev[venueId].quantity - 1) }
    }));
  };

  const handleConfirmOrder = async (venue) => {
    const orderData = orders[venue.id];
    const option = venue.options.find(opt => opt.name === orderData.item);
    if (!option) return;

    const amount = option.price * orderData.quantity;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_URL}/transactions/pay`, { 
        amount: amount,
        venue: venue.dbName,
        itemName: orderData.item,
        quantity: orderData.quantity
      }, config);
      
      toast.success(`${orderData.quantity}x ${orderData.item} ordered successfully!`);
      setBalance(res.data.newBalance);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Top Banner */}
      <div className="bg-[#415a77] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden mb-12 shadow-lg">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#2e4259] rounded-full blur-xl -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute top-1/2 right-[20%] w-[300px] h-[300px] bg-[#3a526d] rounded-full blur-2xl opacity-60"></div>

        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-wider text-white/70 uppercase mb-2">Welcome Back, {user?.name || 'Student'}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-white leading-tight">Ready for your next<br/>meal?</h1>

          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 inline-flex flex-col">
              <span className="text-sm text-white/70 mb-1">Available Balance</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">{balance}</span>
                <span className="text-sm text-white/70">Credits</span>
              </div>
            </div>
            
            <button 
              onClick={handleTopUp}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-[#064e3b] font-bold py-3 px-6 rounded-full flex items-center space-x-2 transition shadow-lg mt-2 md:mt-0"
            >
              <Plus className="w-5 h-5" />
              <span>Top Up Credits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Pending Order */}
      {pendingOrder && (
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl p-6 text-white mb-12 shadow-lg flex flex-col md:flex-row justify-between items-center sm:px-10">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="text-xs text-orange-100 font-black mb-1 tracking-widest uppercase">Your Active Order</h3>
            <p className="text-3xl font-extrabold">{pendingOrder.itemName}</p>
            <p className="text-sm mt-1 font-semibold text-orange-50">{pendingOrder.quantity}x • {pendingOrder.itemCategory}</p>
          </div>
          <div className="bg-white text-orange-900 rounded-2xl p-4 text-center min-w-[150px] shadow-sm transform hover:scale-105 transition duration-300">
            <p className="text-[10px] font-black tracking-widest mb-1 text-orange-600 uppercase">Your Token No</p>
            <p className="text-4xl font-black">#{pendingOrder.tokenNumber}</p>
          </div>
        </div>
      )}

      {/* Ordering Venue Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Ordering Venue</h2>
        <p className="text-gray-500 mb-6">Fuel your academic journey with fresh campus favorites</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {venues.map((venue) => {
            const orderData = orders[venue.id];
            return (
              <div key={venue.id} className="bg-[#eef2ff] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                {/* Card Header Image */}
                <div className="h-44 relative bg-gray-200">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  {venue.badge && (
                    <div className={`absolute top-4 left-4 ${venue.badgeColor} text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm`}>
                      {venue.badge}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{venue.name}</h3>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">SELECT ITEM</label>
                    <div className="relative">
                      <select 
                        value={orderData.item}
                        onChange={(e) => handleOrderChange(venue.id, 'item', e.target.value)}
                        className="w-full appearance-none bg-indigo-100/50 border-none text-indigo-900 text-sm font-semibold rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {venue.options.map(opt => (
                          <option key={opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-6 flex-grow">
                    <label className="block text-xs font-bold text-gray-500 mb-1">{venue.qtyLabel || 'QUANTITY'}</label>
                    <div className="flex items-center justify-between bg-indigo-100/50 rounded-xl p-1">
                      <button 
                        type="button"
                        onClick={() => decrementQty(venue.id)}
                        className="w-10 h-10 flex items-center justify-center text-indigo-500 hover:bg-indigo-200 rounded-lg transition"
                      >
                        <span className="text-xl font-medium">-</span>
                      </button>
                      <span className="font-bold text-indigo-900">{orderData.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => incrementQty(venue.id)}
                        className="w-10 h-10 flex items-center justify-center text-indigo-500 hover:bg-indigo-200 rounded-lg transition"
                      >
                        <span className="text-xl font-medium">+</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConfirmOrder(venue)}
                    className="w-full bg-[#415a77] hover:bg-[#2d425c] text-white font-medium py-3 rounded-2xl flex items-center justify-center space-x-2 transition shadow-md mt-auto"
                  >
                    <span>Confirm Order</span>
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-4xl mx-auto">
        
        {/* Recent Transactions */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <History className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          </div>

          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No recent transactions</p>
            ) : (
              history.slice(0, showAllHistory ? history.length : 3).map((tx) => {
                const isSender = tx.sender?._id === user._id || tx.sender === user._id;
                const isCredit = tx.type === 'credit';
                const isPayment = tx.type === 'payment';
                
                let title = '';
                if (tx.status === 'failed') {
                  title = 'Transaction Failed (Refunded)';
                } else if (isPayment) {
                  title = tx.itemName && tx.quantity 
                    ? `${tx.quantity}x ${tx.itemName}`
                    : 'Mess Payment';
                } else if (isCredit) {
                  title = 'Monthly Credit';
                } else {
                  title = isSender ? `Transfer to ${tx.receiver?.rollNumber}` : `Received from ${tx.sender?.rollNumber}`;
                }

                // If failed, make sure the amount shown as returned (if we were the sender)
                const amountSign = tx.status === 'failed' ? '+' : (isSender && !isCredit ? '-' : '+');
                const amountColor = tx.status === 'failed' ? 'text-gray-400 line-through' : (isSender && !isCredit ? 'text-red-500' : 'text-emerald-500');

                return (
                  <div key={tx._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition px-2 rounded-lg">
                    <div>
                      <p className={`font-semibold text-sm ${tx.status === 'failed' ? 'text-red-500' : 'text-gray-800'}`}>{title}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                    <div className={`font-bold text-sm ${amountColor}`}>
                      {amountSign} {tx.amount} Credits
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {history.length > 3 && (
            <button 
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="w-full mt-4 text-center text-sm text-gray-500 hover:text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
            >
              {showAllHistory ? 'Show Less' : 'View All History'}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
