
import React, { useState } from 'react';
import { UserMode } from '../types.ts';
import { IRISH_UNIVERSITIES } from '../constants.tsx';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (userData: any) => void;
  initialMode?: UserMode;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, initialMode = UserMode.STUDENT }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [mode, setMode] = useState<UserMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'warning' | 'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    university: '',
    companyName: '',
    password: '',
    confirmPassword: ''
  });

  const validate = () => {
    // Check for hardcoded test logins first (skip standard email validation for these)
    const isTestUser = (formData.email === 'user1' || formData.email === 'user2') && formData.password === 'toms1902';
    
    if (!isTestUser && !formData.email.includes('@')) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }
    if (!isTestUser && formData.password.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', text: 'Passwords do not match.' });
      return false;
    }
    if (!isLogin) {
      if (mode === UserMode.STUDENT && !formData.university) {
        setStatus({ type: 'error', text: 'Please select your university.' });
        return false;
      }
      if (mode === UserMode.EMPLOYER && !formData.companyName) {
        setStatus({ type: 'error', text: 'Please enter your company name.' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    
    if (!validate()) return;
    
    setLoading(true);

    // Mock API call simulation
    setTimeout(() => {
      let finalMode = mode;
      let finalFirstName = formData.firstName;
      let finalLastName = formData.lastName;
      let finalUni = formData.university;
      let finalCompany = formData.companyName;

      // Logic for hardcoded test logins
      if (isLogin && formData.password === 'toms1902') {
        if (formData.email === 'user1') {
          finalMode = UserMode.STUDENT;
          finalFirstName = 'Test';
          finalLastName = 'Student';
          finalUni = 'Trinity College Dublin (TCD)';
        } else if (formData.email === 'user2') {
          finalMode = UserMode.EMPLOYER;
          finalFirstName = 'Global';
          finalLastName = 'Ventures';
          finalCompany = 'Global Ventures Ltd';
        } else if (!formData.email.includes('@')) {
           // If not user1/user2 and no @, fail
           setLoading(false);
           setStatus({ type: 'error', text: 'Invalid login credentials.' });
           return;
        }
      } else if (isLogin && (formData.email === 'user1' || formData.email === 'user2')) {
        // Correct email but wrong password
        setLoading(false);
        setStatus({ type: 'error', text: 'Incorrect password.' });
        return;
      }

      const mockUser = {
        mode: finalMode,
        email: formData.email,
        studentId: finalMode === UserMode.STUDENT ? 's-' + Math.random().toString(36).substr(2, 5) : undefined,
        employerId: finalMode === UserMode.EMPLOYER ? 'e-' + Math.random().toString(36).substr(2, 5) : undefined,
        token: 'mock-jwt-token',
        firstName: finalMode === UserMode.STUDENT ? (finalFirstName || 'Student') : (finalCompany || 'Employer'),
        lastName: finalLastName,
        university: finalUni,
        companyName: finalCompany
      };
      
      setStatus({ type: 'success', text: isLogin ? 'Welcome back!' : 'Account created successfully!' });
      
      setTimeout(() => {
        onSuccess(mockUser);
      }, 800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-warm-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
              <p className="text-zinc-500 text-xs mt-1">
                {mode === UserMode.STUDENT ? 'Finding your next campus gig' : 'Hiring Irish student talent'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-warm-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex p-1 bg-warm-50 dark:bg-zinc-950 rounded-xl mb-4 border border-warm-100 dark:border-zinc-800">
            <button 
              onClick={() => { setMode(UserMode.STUDENT); setStatus(null); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${mode === UserMode.STUDENT ? 'bg-white dark:bg-zinc-800 shadow-sm text-magenta' : 'text-zinc-400'}`}
            >
              <span className="material-symbols-outlined text-sm">school</span>
              Student
            </button>
            <button 
              onClick={() => { setMode(UserMode.EMPLOYER); setStatus(null); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${mode === UserMode.EMPLOYER ? 'bg-white dark:bg-zinc-800 shadow-sm text-magenta' : 'text-zinc-400'}`}
            >
              <span className="material-symbols-outlined text-sm">business</span>
              Employer
            </button>
          </div>

          <div className="flex justify-center gap-8 mb-6 border-b border-warm-100 dark:border-zinc-800">
            <button 
              onClick={() => { setIsLogin(true); setStatus(null); }}
              className={`pb-3 text-sm font-bold transition-all relative ${isLogin ? 'text-magenta' : 'text-zinc-400'}`}
            >
              Login
              {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-magenta rounded-full"></div>}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setStatus(null); }}
              className={`pb-3 text-sm font-bold transition-all relative ${!isLogin ? 'text-magenta' : 'text-zinc-400'}`}
            >
              Sign Up
              {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-magenta rounded-full"></div>}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {status && (
              <div className={`p-3 rounded-xl text-xs font-bold animate-in slide-in-from-top-2 border ${
                status.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' :
                status.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                'bg-green-50 text-green-600 border-green-100'
              }`}>
                {status.text}
              </div>
            )}

            {!isLogin && (
              <>
                {mode === UserMode.STUDENT ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">First Name</label>
                        <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Last Name</label>
                        <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">University</label>
                      <select 
                        required 
                        value={formData.university} 
                        onChange={e => setFormData({...formData, university: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all appearance-none"
                      >
                        <option value="">Select your institution...</option>
                        {IRISH_UNIVERSITIES.map(uni => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Company Name</label>
                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" placeholder="e.g. Dublin Tech Hub" />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email / Username</label>
              <input required type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" placeholder={isLogin ? "e.g. user1" : "e.g. student@tcd.ie"} />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Password</label>
              <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Confirm Password</label>
                <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-magenta outline-none transition-all" />
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full py-4 bg-magenta hover:bg-magenta-600 text-white font-bold rounded-xl shadow-lg shadow-magenta/20 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
            
            {isLogin && (
              <p className="text-[10px] text-zinc-400 text-center mt-2">
                Tip: Try <strong>user1</strong> (Student) or <strong>user2</strong> (Employer) <br/> with password <strong>toms1902</strong>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
