import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle, Sparkles } from 'lucide-react';

export default function OwnerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (trimmedUser === 'rithik0711' && trimmedPass === '123456') {
        setIsLoading(false);
        setError('');
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Invalid username or password. Please check your credentials.');
      }
    }, 400);
  };

  const handleFillCredentials = () => {
    setUsername('rithik0711');
    setPassword('123456');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div 
        className="relative bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#eeddb0] animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="owner-login-title"
      >
        {/* Close Button */}
        <button 
          type="button" 
          className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-[#eae7de] hover:bg-[#f6f5ef] text-[#8c93a3] hover:text-[#1a1c22] flex items-center justify-center cursor-pointer transition-colors" 
          onClick={onClose}
          aria-label="Close owner login"
        >
          <X size={18} />
        </button>

        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center shadow-[0_6px_20px_rgba(197,155,39,0.3)]">
            <ShieldCheck size={32} />
          </div>
        </div>

        <h2 id="owner-login-title" className="text-xl font-extrabold text-[#1a1c22] text-center mb-1">Owner Portal Access</h2>
        <p className="text-xs text-[#575e6d] text-center leading-relaxed mb-5">
          Sign in to manage quotations, track orders, and export Excel or PDF reports.
        </p>

        {/* Demo Helper Box */}
        <div 
          className="flex items-center justify-between bg-[#fbf5e6] border border-dashed border-[#c59b27] px-3.5 py-2.5 rounded-xl mb-5 cursor-pointer hover:bg-[#f7eed5] transition-all"
          onClick={handleFillCredentials} 
          title="Click to autofill credentials"
        >
          <div className="flex items-center gap-2 text-xs text-[#946c1a] font-medium">
            <Sparkles size={14} className="text-[#c59b27]" />
            <span>Authorized: <b className="font-bold text-[#1a1c22]">rithik0711</b> / <b className="font-bold text-[#1a1c22]">123456</b></span>
          </div>
          <span className="text-[10px] font-black uppercase text-white bg-[#b38728] px-2 py-0.5 rounded-full">Auto Fill</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl mb-4" role="alert">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label htmlFor="owner-username-input" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
              <input
                id="owner-username-input"
                type="text"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20 rounded-xl outline-none transition-all"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="owner-password-input" className="block text-xs font-bold text-[#1a1c22] mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-[#8c93a3] pointer-events-none" />
              <input
                id="owner-password-input"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#d8d4c7] focus:border-[#b38728] focus:ring-2 focus:ring-[#c59b27]/20 rounded-xl outline-none transition-all"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 text-[#8c93a3] hover:text-[#1a1c22] p-1 cursor-pointer transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            className="w-full py-3 px-4 bg-gold-btn text-white font-bold text-sm rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(197,155,39,0.28)] transition-all cursor-pointer hover:shadow-[0_6px_20px_rgba(197,155,39,0.38)] mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Owner Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
