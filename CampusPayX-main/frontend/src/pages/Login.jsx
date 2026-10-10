import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, Fingerprint, QrCode, Phone, Building } from 'lucide-react';

export default function Login() {
  const [isManager, setIsManager] = useState(false);
  const [formData, setFormData] = useState({
    rollNumber: '',
    phoneNumber: '',
    hostelName: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginPayload = { ...formData, isManager };
      const user = await login(loginPayload);
      toast.success('Login successful!');
      if (user.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/student');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-3xl z-0 pointer-events-none"></div>

      {/* Header */}
      <div className="text-center z-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mx-auto bg-[#364F73] text-white rounded-full w-14 h-14 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
           <img src="/campuspayx_logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <h1 className="text-[28px] font-bold text-[#1E293B] tracking-tight">Campus Pay X</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Empowering Student Finances</p>
      </div>

      {/* Login Card */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-[420px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative border border-white/50">
        
        {/* Role Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/40 border border-white/50 shadow-inner backdrop-blur-md rounded-full p-1 flex items-center w-full max-w-[200px] relative">
            <button 
              type="button" 
              onClick={() => setIsManager(false)}
              className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all z-10 ${!isManager ? 'text-[#364F73]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Student
            </button>
            <button 
              type="button" 
              onClick={() => setIsManager(true)}
              className={`flex-1 text-xs font-semibold py-2 rounded-full transition-all z-10 ${isManager ? 'text-[#364F73]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Manager
            </button>
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 left-1 ${isManager ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {!isManager ? (
            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium ml-1">Roll No (e.g., STU-2024-8842)</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full bg-[#EEF2F9] text-[#1E293B] text-sm rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#364F73]/50 transition-all placeholder:text-gray-400"
                  placeholder="STU-2024-8842"
                  required={!isManager}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium ml-1">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-white/50 text-[#1E293B] text-sm rounded-xl py-3.5 pl-10 pr-4 border border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] focus:outline-none focus:bg-white/80 focus:border-white/60 focus:shadow-[0_8px_16px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-300 placeholder:text-gray-500"
                    placeholder="+1234567890"
                    required={isManager}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium ml-1">Hostel Name</label>
                <div className="relative mt-1">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="hostelName"
                    value={formData.hostelName}
                    onChange={handleChange}
                    className="w-full bg-white/50 text-[#1E293B] text-sm rounded-xl py-3.5 pl-10 pr-4 border border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] focus:outline-none focus:bg-white/80 focus:border-white/60 focus:shadow-[0_8px_16px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-300 placeholder:text-gray-500"
                    placeholder="Aryabhatta Hostel"
                    required={isManager}
                  />
                </div>
              </div>
            </>
          )}

          <div className="mb-6">
            <div className="flex justify-between mt-1 items-end mb-1">
               <label className="text-xs text-gray-500 font-medium ml-1">Password</label>
               <a href="#" className="text-[10px] text-gray-400 hover:text-[#364F73] transition-colors">Forgot Password?</a>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/50 text-[#1E293B] text-sm rounded-xl py-3.5 pl-10 pr-12 border border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] focus:outline-none focus:bg-white/80 focus:border-white/60 focus:shadow-[0_8px_16px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.5)] transition-all duration-300 placeholder:text-gray-500 font-medium tracking-wider"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/40 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-white/50 rounded-lg text-gray-500 hover:text-gray-700 hover:shadow-[0_6px_15px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] hover:bg-white/60 transition-all z-10"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#364F73] text-white py-3.5 rounded-xl text-sm font-semibold shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.25)] hover:-translate-y-[2px] active:shadow-[0_5px_10px_rgba(0,0,0,0.1)] active:translate-y-[1px] transition-all duration-300 mb-6"
          >
            Login
          </button>



          {/* Sign Up Link */}
          <div className="text-center text-xs text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#364F73] hover:underline font-semibold ml-1">
              Sign Up
            </Link>
          </div>
        </form>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 text-[10px] text-gray-400 font-medium tracking-widest uppercase z-10">
        © 2024 Campus Pay X • Secure Academic Finance
      </div>
    </div>
  );
}
