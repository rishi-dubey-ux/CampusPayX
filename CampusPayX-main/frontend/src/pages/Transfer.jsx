import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, AtSign, User as UserIcon } from 'lucide-react';
import { API_URL, SOCKET_URL } from '../config';

export default function Transfer() {
  const { user, setUser } = useContext(AuthContext);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [history, setHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [transferRoll, setTransferRoll] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const meRes = await axios.get(`${API_URL}/users/me`, config);
      setBalance(meRes.data.balance);
      setUser({ ...user, balance: meRes.data.balance });
      
      const histRes = await axios.get(`${API_URL}/transactions/history`, config);
      
      // Filter only peer to peer transfers
      const transferHistory = histRes.data.filter(tx => tx.type === 'transfer');
      setHistory(transferHistory);
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

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferAmount || !transferRoll) {
        toast.error('Please fill in both fields');
        return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_URL}/transactions/transfer`, { 
        amount: Number(transferAmount),
        receiverRollNumber: transferRoll
      }, config);
      
      toast.success('Transfer successful!');
      setBalance(res.data.newBalance);
      setTransferAmount('');
      setTransferRoll('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#1f2937] mb-3">Send Credits</h1>
        <p className="text-[#6b7280] max-w-md mx-auto">
          Seamlessly transfer funds to any student using their university roll number.
        </p>
      </div>

      {/* Transfer Widget */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12 relative overflow-hidden">
        {/* Subtle decorative background (optional based on image exactness, UI in image has white rounded card) */}
        
        <form onSubmit={handleTransfer} className="space-y-6 max-w-md mx-auto relative z-10">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">
              FRIEND'S ROLL NUMBER
            </label>
            <div className="relative">
              <input
                type="text"
                value={transferRoll}
                onChange={(e) => setTransferRoll(e.target.value)}
                className="w-full bg-[#eef2ff] border-none text-indigo-900 text-sm font-medium rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. CS2024-102"
                required
              />
              <AtSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">
              AMOUNT TO SEND
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-full bg-[#eef2ff] border-none text-indigo-900 text-lg font-medium rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="0.00"
              min="1"
              required
            />
            <p className="text-xs text-center text-gray-400 mt-2">Available Balance: {balance} Credits</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#3b4c61] hover:bg-[#2d3a4b] text-white font-medium py-4 rounded-full flex items-center justify-center space-x-2 transition shadow-md"
          >
            <span>Transfer Credits</span>
            <Send className="w-4 h-4 ml-2 rtl:rotate-180" />
          </button>
        </form>
      </div>

      {/* History Widget */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-gray-800">Recent Transfers</h2>
          <button 
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition uppercase tracking-wider"
          >
            {showAllHistory ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-100">
              No recent transfers found
            </div>
          ) : (
            history.slice(0, showAllHistory ? history.length : 3).map((tx) => {
              const isSender = tx.sender?._id === user._id || tx.sender === user._id;
              
              // We are sending money if isSender is true.
              // So the relevant person to show is the RECEIVER.
              // If we received money, the relevant person is the SENDER.
              const relevantPerson = isSender ? tx.receiver : tx.sender;
              const name = relevantPerson?.name || 'Unknown Student';
              const roll = relevantPerson?.rollNumber || 'Unknown Roll';
              
              const amountSign = isSender ? '-' : '+';
              const amountColor = isSender ? 'text-[#1f2937]' : 'text-emerald-600';
              
              // Generate pseudo-avatar letters
              const initials = name.substring(0, 2).toUpperCase();

              return (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl transition hover:bg-white border border-transparent hover:border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-800 font-bold shadow-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{name}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-0.5">
                        ROLL: {roll}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${amountColor}`}>
                      {amountSign}{tx.amount}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
