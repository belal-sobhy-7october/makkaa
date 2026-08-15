import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Lock, Save } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { t } = useLanguage();
  usePageTitle(t('profile.title'));
  const navigate = useNavigate();
  const { user, isLoggedIn, refreshUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const [passwordMode, setPasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { return; }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('profile.title')}</h1>
        <p className="text-makka-cocoa/70 mb-6">سجل الدخول لعرض حسابك</p>
        <Link to="/login" state={{ from: { pathname: '/profile' } }} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await endpoints.users.updateMe({ name, phone });
      refreshUser();
      toast.show('تم حفظ التغييرات');
    } catch (err) {
      toast.show(err?.response?.data?.message || 'فشل الحفظ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.show('كلمة المرور غير متطابقة', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast.show('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await endpoints.users.changePassword({ password: newPassword });
      toast.show('تم تغيير كلمة المرور بنجاح');
      setPasswordMode(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.show(err?.response?.data?.message || 'فشل تغيير كلمة المرور', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-8">{t('profile.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold text-makka-cocoa mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-makka-gold" /> المعلومات الشخصية
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-makka-sand px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-makka-cocoa mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-makka-sand px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.email')}</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-makka-sand px-3 py-2.5 bg-makka-sand/20 text-makka-cocoa/60"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-makka-brown text-white text-sm font-medium hover:bg-makka-cocoa disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>

          <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold text-makka-cocoa mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-makka-gold" /> {t('profile.changePassword')}
            </h2>
            {passwordMode ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.password')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-makka-sand px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-makka-cocoa mb-1">{t('auth.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-makka-sand px-3 py-2.5"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={changingPassword} className="px-6 py-2.5 rounded-xl bg-makka-brown text-white text-sm font-medium hover:bg-makka-cocoa disabled:opacity-50 transition-colors">
                    {changingPassword ? t('common.loading') : t('common.save')}
                  </button>
                  <button type="button" onClick={() => setPasswordMode(false)} className="px-4 py-2.5 rounded-xl border border-makka-sand text-sm text-makka-cocoa hover:bg-makka-sand/30 transition-colors">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setPasswordMode(true)}
                className="text-sm text-makka-brown hover:text-makka-gold transition-colors"
              >
                {t('profile.changePassword')}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/addresses"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover transition-all group"
          >
            <MapPin className="w-6 h-6 text-makka-gold" />
            <div>
              <p className="font-medium text-makka-cocoa group-hover:text-makka-brown transition-colors">{t('profile.addresses')}</p>
              <p className="text-xs text-makka-cocoa/60">إدارة عناوين التوصيل</p>
            </div>
          </Link>
          <Link
            to="/orders"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover transition-all group"
          >
            <div className="w-6 h-6 flex items-center justify-center text-makka-gold">📦</div>
            <div>
              <p className="font-medium text-makka-cocoa group-hover:text-makka-brown transition-colors">{t('orders.title')}</p>
              <p className="text-xs text-makka-cocoa/60">عرض طلباتك</p>
            </div>
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover transition-all group"
          >
            <div className="w-6 h-6 flex items-center justify-center text-makka-gold">❤️</div>
            <div>
              <p className="font-medium text-makka-cocoa group-hover:text-makka-brown transition-colors">{t('wishlist.title')}</p>
              <p className="text-xs text-makka-cocoa/60">المنتجات المفضلة</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
