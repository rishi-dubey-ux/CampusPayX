import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, User as UserIcon, Sun, Moon, Download } from 'lucide-react';
import logo from "../assets/logo.jpg";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 flex-1">
          
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-8">
              <img src={logo} alt="CampusPayX Logo" className="h-10 w-auto object-contain" />
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mr-4">
                CampusPayX
              </span>
            </div>

            {user && user.role === 'student' && (
              <div className="hidden md:flex space-x-4">
                <Link 
                  to="/student"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/student' ? 'bg-[#eef2ff] text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/transfer"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/transfer' ? 'bg-[#eef2ff] text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  P2P Transfer
                </Link>
                <Link 
                  to="/track"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/track' ? 'bg-[#eef2ff] text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  Track
                </Link>
              </div>
            )}

            {user && user.role === 'manager' && (
              <div className="hidden md:flex space-x-4 ml-4">
                <Link 
                  to="/manager"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/manager' ? 'text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/manager/history"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/manager/history' ? 'text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  History
                </Link>
                <Link 
                  to="/manager/track"
                  className={`text-sm font-bold px-3 py-2 rounded-full transition ${location.pathname === '/manager/track' ? 'text-indigo-900 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-indigo-900'}`}
                >
                  Student Track
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition shadow-sm"
                aria-label="Install App"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary/80 transition flex items-center shadow-sm text-foreground/80 hover:text-foreground"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && (
              <>
                <span className="text-sm font-medium text-foreground opacity-80 hidden sm:inline-block">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-secondary/80 transition flex items-center shadow-sm"
                  aria-label="Log Out"
                >
                  <LogOut className="h-5 w-5 text-destructive" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
