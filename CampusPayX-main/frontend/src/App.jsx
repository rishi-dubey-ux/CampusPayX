import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import Transfer from './pages/Transfer';
import Track from './pages/Track';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerHistory from './pages/ManagerHistory';
import ManagerTrack from './pages/ManagerTrack';
import SplashScreen from './components/SplashScreen';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'manager' ? '/manager' : '/student'} replace />;

  return children;
};

function App() {
  const { user, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to={user ? (user.role === 'manager' ? '/manager' : '/student') : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/transfer" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Transfer />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/track" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Track />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/manager/history" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ManagerHistory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/manager/track" 
            element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <ManagerTrack />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
