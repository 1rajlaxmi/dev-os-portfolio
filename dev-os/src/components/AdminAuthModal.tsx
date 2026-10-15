import { useState } from 'react';
import { Lock, Unlock, X, ShieldAlert, KeyRound } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { login, setAuthModalOpen } from '../store/slices/adminSlice';
import { toast } from 'sonner';
import { sound } from '../utils/sound';

export const AdminAuthModal = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.admin.isAuthModalOpen);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      dispatch(login(password));
      sound.playClick();
      toast.success('Admin Mode Unlocked! 🔓', {
        description: 'You can now Add, Edit, and Delete projects, skills, and data.',
      });
      setPassword('');
      setError('');
    } catch {
      sound.playErrorChime();
      setError('Incorrect master password. Please try again.');
      toast.error('Authentication Failed 🔒', {
        description: 'Incorrect master password.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9700] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => dispatch(setAuthModalOpen(false))}
    >
      <div
        className="w-full max-w-md bg-[#16161a] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Security Authentication</h3>
              <p className="text-xs text-gray-400 mt-0.5">Enter passcode to unlock session controls</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(setAuthModalOpen(false))}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1.5 block">
              Access Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter access passcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm placeholder-gray-500 outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                autoFocus
              />
              <KeyRound size={15} className="absolute left-3 top-3 text-gray-500" />
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <ShieldAlert size={13} />
                {error}
              </p>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            🔐 Session Passcode Verification Required.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => dispatch(setAuthModalOpen(false))}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-900/40 transition-all active:scale-95"
            >
              <Unlock size={14} />
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
