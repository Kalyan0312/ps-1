import React, { useState } from 'react';
import { Briefcase, Users, ShieldCheck, ArrowRight, Sparkles, Lock, Phone, User as UserIcon } from 'lucide-react';
import { UserRole, UserProfile, loginUser, registerUser } from '@/services/auth';

interface RoleSelectorProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onAuthenticated }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('worker123');
  const [fullName, setFullName] = useState('Ramesh Kumar');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'worker') {
      setPhone('9876543210');
      setPassword('worker123');
      setFullName('Ramesh Kumar');
    } else if (role === 'customer') {
      setPhone('9876543211');
      setPassword('customer123');
      setFullName('Priya Sharma');
    } else if (role === 'admin') {
      setPhone('9876543212');
      setPassword('admin123');
      setFullName('Ananya Sen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegisterMode) {
        const res = await registerUser(fullName, phone, password, selectedRole);
        onAuthenticated(res.user);
      } else {
        const res = await loginUser(phone, password);
        onAuthenticated(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex flex-col items-center justify-center p-4 selection:bg-[#9A5B3A]/20">
      {/* Subtle warm background elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EFE2D2] rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE2D2] border border-[#E0D5C8] text-[#9A5B3A] text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C9684A]" />
            <span>Cooperative Gig System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] font-display">
            Cooperative<span className="text-[#9A5B3A]">Gig</span>
          </h1>
          <p className="text-[#6F6A63] text-sm">
            Fair work. Trusted service. Shared prosperity.
          </p>
        </div>

        {/* Role Tabs Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#E0D5C8] shadow-sm space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#6F6A63] uppercase tracking-wider block text-center font-display">
              Select your role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#F7F3EC] rounded-2xl border border-[#E0D5C8]">
              <button
                type="button"
                onClick={() => handleRoleSelect('worker')}
                className={`flex flex-col items-center justify-center gap-1 min-h-[52px] py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'worker'
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#6F6A63] hover:text-[#171717] hover:bg-[#EFE2D2]/60'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Worker</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`flex flex-col items-center justify-center gap-1 min-h-[52px] py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#6F6A63] hover:text-[#171717] hover:bg-[#EFE2D2]/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`flex flex-col items-center justify-center gap-1 min-h-[52px] py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-[#9A5B3A] text-white shadow-sm'
                    : 'text-[#6F6A63] hover:text-[#171717] hover:bg-[#EFE2D2]/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#A94A43]/10 border border-[#A94A43]/30 text-[#A94A43] text-xs font-medium">
                {error}
              </div>
            )}

            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171717]">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="coop-input pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717]">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="coop-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="coop-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full min-h-[48px] text-sm shadow-md mt-2 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : isRegisterMode ? 'Register' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="pt-2 text-center border-t border-[#E0D5C8]">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="min-h-[48px] px-3 py-2 text-xs text-[#9A5B3A] hover:text-[#C9684A] font-semibold transition-colors inline-flex items-center justify-center"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-[#6F6A63]">
          Zero Platform Commissions • 85% Direct Worker Wage • 5% Welfare Fund
        </p>
      </div>
    </div>
  );
};
export default RoleSelector;
