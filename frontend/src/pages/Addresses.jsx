import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Addresses() {
  const { t, locale } = useLanguage();
  usePageTitle(t('profile.addresses'));
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ details: '', phone: '', city: '', postalCode: '' });
  const [submitting, setSubmitting] = useState(false);
  const isAr = locale === 'ar';

  const loadAddresses = () => {
    if (!isLoggedIn) { setLoading(false); return; }
    endpoints.addresses.list()
      .then((res) => setAddresses(res.data.data || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAddresses(); }, [isLoggedIn]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.details.trim() || !form.phone.trim()) {
      toast.show(t('validation.shippingRequired'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      await endpoints.addresses.add(form);
      toast.show('تمت إضافة العنوان');
      setForm({ details: '', phone: '', city: '', postalCode: '' });
      setShowForm(false);
      loadAddresses();
    } catch (err) {
      toast.show(err?.response?.data?.message || 'فشل الإضافة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا العنوان؟')) return;
    try {
      await endpoints.addresses.remove(id);
      loadAddresses();
    } catch (err) {
      toast.show(err?.response?.data?.message || 'فشل الحذف', 'error');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('profile.addresses')}</h1>
        <p className="text-makka-cocoa/70 mb-6">سجل الدخول لعرض العناوين</p>
        <Link to="/login" state={{ from: { pathname: '/addresses' } }} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/profile" className="inline-flex items-center gap-1 text-makka-brown hover:text-makka-gold transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('profile.title')}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa">{t('profile.addresses')}</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? t('common.cancel') : t('checkout.newAddress')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6 mb-6 space-y-4">
          <div>
            <textarea
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              placeholder={t('checkout.addressPlaceholder')}
              required
              rows={2}
              className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder={t('checkout.phonePlaceholder')}
              required
              className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder={t('checkout.cityPlaceholder')}
              className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              placeholder={t('checkout.postalPlaceholder')}
              className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-makka-brown text-white text-sm font-medium hover:bg-makka-cocoa disabled:opacity-50 transition-colors"
          >
            {submitting ? t('common.loading') : t('common.save')}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/20" />
          <p className="text-makka-cocoa/70">لا توجد عناوين محفوظة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white rounded-2xl border border-makka-sand shadow-soft p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-makka-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-makka-cocoa">{addr.details}</p>
                  <p className="text-xs text-makka-cocoa/60 mt-1" dir="ltr">{addr.phone}{addr.city ? ` - ${addr.city}` : ''}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(addr._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                aria-label={t('cart.remove')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
