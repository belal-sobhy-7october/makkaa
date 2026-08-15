import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  const { t } = useLanguage();
  usePageTitle(t('auth.login'));
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/';
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        if (password !== confirmPassword) {
          setError('كلمة المرور غير متطابقة');
          setSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setSubmitting(false);
          return;
        }
        await signup(name, email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('common.loginError');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-makka-sand shadow-card-hover p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-makka-brown/10 flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? <LogIn className="w-7 h-7 text-makka-brown" /> : <UserPlus className="w-7 h-7 text-makka-brown" />}
            </div>
            <h1 className="font-display text-2xl font-semibold text-makka-cocoa">
              {mode === 'login' ? t('auth.login') : t('auth.signupTitle')}
            </h1>
            <p className="text-makka-cocoa/70 text-sm mt-1">
              {mode === 'login' ? t('auth.loginDesc') : t('auth.signupDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.name')}</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-makka-cocoa/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-makka-sand pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-makka-gold/50 focus:border-makka-gold transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-makka-cocoa/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-makka-sand pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-makka-gold/50 focus:border-makka-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-makka-cocoa/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-makka-sand pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-makka-gold/50 focus:border-makka-gold transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-makka-cocoa/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-makka-sand pr-10 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-makka-gold/50 focus:border-makka-gold transition-all"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-makka-brown text-white font-medium hover:bg-makka-cocoa hover:shadow-glow disabled:opacity-50 transition-all duration-200"
            >
              {submitting
                ? (mode === 'login' ? t('auth.submittingLogin') : t('auth.submitSignup'))
                : (mode === 'login' ? t('auth.submitLogin') : t('auth.submitSignup'))}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-makka-cocoa/70">
            {mode === 'login' ? (
              <p>{t('auth.noAccount')} <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-makka-brown hover:text-makka-gold font-medium">{t('auth.signupLink')}</button></p>
            ) : (
              <p>{t('auth.haveAccount')} <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-makka-brown hover:text-makka-gold font-medium">{t('auth.login')}</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
