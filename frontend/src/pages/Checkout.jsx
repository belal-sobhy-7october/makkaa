import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, ShoppingBag, CheckCircle } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
  const { t, locale } = useLanguage();
  usePageTitle(t('checkout.title'));
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { cart, cartCount, cartTotal, loading: cartLoading } = useCart();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ details: '', phone: '', city: '', postalCode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [errors, setErrors] = useState({});
  const isAr = locale === 'ar';

  useEffect(() => {
    if (!cartLoading && (!isLoggedIn || !cart || cartCount === 0)) {
      if (!isLoggedIn) navigate('/login', { state: { from: { pathname: '/checkout' } } });
      else if (!cart || cartCount === 0) navigate('/cart');
    }
  }, [isLoggedIn, cart, cartCount, cartLoading, navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      endpoints.addresses.list()
        .then((res) => {
          const addrs = res.data.data || [];
          setAddresses(addrs);
          if (addrs.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addrs[0]._id);
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, selectedAddressId]);

  const validate = () => {
    const errs = {};
    const addr = showNewAddress ? newAddress : (addresses.find((a) => a._id === selectedAddressId) || {});
    if (!addr.details || !addr.details.trim()) errs.details = t('validation.addressRequired');
    if (!addr.phone || !addr.phone.trim()) errs.phone = t('validation.phoneRequired');
    else if (!/^[\d\+\-\(\)\s]{8,20}$/.test(addr.phone)) errs.phone = t('validation.phoneInvalid');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const addr = showNewAddress ? newAddress : (addresses.find((a) => a._id === selectedAddressId) || {});
      const res = await endpoints.orders.create(null, {
        shippingAddress: {
          details: addr.details,
          phone: addr.phone,
          city: addr.city || null,
          postalCode: addr.postalCode || null,
        },
      });
      setOrderId(res.data.data?.id || res.data.data?._id);
      setOrderSuccess(true);
    } catch (err) {
      toast.show(err?.response?.data?.message || t('common.orderError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (orderSuccess) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-2">{t('orders.orderSuccess')}</h1>
        <p className="text-makka-cocoa/70 mb-2">رقم الطلب: {orderId?.slice(0, 8)}</p>
        <p className="text-makka-cocoa/70 mb-8">{t('checkout.title')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/orders" className="px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
            {t('orders.title')}
          </Link>
          <Link to="/products" className="px-6 py-3 rounded-xl border border-makka-sand text-makka-cocoa hover:bg-makka-sand/30 transition-colors">
            {t('home.browseProducts')}
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !cart || cartCount === 0) return null;

  const items = cart.cartItems || [];
  const selectedAddr = showNewAddress ? newAddress : (addresses.find((a) => a._id === selectedAddressId) || {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-makka-gold" />
              <h2 className="font-display text-lg font-semibold text-makka-cocoa">{t('checkout.shippingAddress')}</h2>
            </div>

            {addresses.length > 0 && !showNewAddress && (
              <div className="space-y-3 mb-4">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-makka-brown bg-makka-brown/5' : 'border-makka-sand hover:border-makka-gold/50'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="sr-only"
                    />
                    <p className="text-sm text-makka-cocoa">{addr.details}</p>
                    <p className="text-xs text-makka-cocoa/60 mt-1">{addr.phone}{addr.city ? ` - ${addr.city}` : ''}</p>
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setShowNewAddress(!showNewAddress); setSelectedAddressId(''); }}
              className="flex items-center gap-2 text-sm text-makka-brown hover:text-makka-gold transition-colors"
            >
              <Plus className="w-4 h-4" />
              {showNewAddress ? addresses.length > 0 ? t('checkout.selectAddress') : t('common.cancel') : t('checkout.newAddress')}
            </button>

            {(showNewAddress || addresses.length === 0) && (
              <div className="mt-4 space-y-4">
                <div>
                  <textarea
                    value={newAddress.details}
                    onChange={(e) => setNewAddress((f) => ({ ...f, details: e.target.value }))}
                    placeholder={t('checkout.addressPlaceholder')}
                    rows={2}
                    className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.details ? 'border-red-400' : 'border-makka-sand'}`}
                  />
                  {errors.details && <p className="text-red-600 text-xs mt-1">{errors.details}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress((f) => ({ ...f, phone: e.target.value }))}
                      placeholder={t('checkout.phonePlaceholder')}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm ${errors.phone ? 'border-red-400' : 'border-makka-sand'}`}
                    />
                    {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((f) => ({ ...f, city: e.target.value }))}
                    placeholder={t('checkout.cityPlaceholder')}
                    className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress((f) => ({ ...f, postalCode: e.target.value }))}
                    placeholder={t('checkout.postalPlaceholder')}
                    className="w-full rounded-xl border border-makka-sand px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            {addresses.length === 0 && !showNewAddress && (
              <p className="text-makka-cocoa/60 text-sm mt-2">{t('checkout.addAddress')}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold text-makka-cocoa mb-4">{t('cart.title')}</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const prod = item.product || {};
                return (
                  <div key={item._id} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 rounded-lg bg-makka-sand/30 overflow-hidden shrink-0 flex items-center justify-center">
                      {prod.imageCover ? (
                        <img src={prod.imageCover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg opacity-40">🧁</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-makka-cocoa line-clamp-1">{isAr ? prod.titleAr || prod.title : prod.title}</p>
                      {item.color && <p className="text-xs text-makka-cocoa/60">{item.color}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-makka-cocoa">{item.quantity} × {item.price}</p>
                      <p className="text-makka-brown font-semibold">{item.quantity * item.price} {t('products.egp')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold text-makka-cocoa">{t('cart.total')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-makka-cocoa/80">
                <span>{t('cart.total')}</span>
                <span>{cartTotal} {t('products.egp')}</span>
              </div>
              {cart.totalPriceAfterDiscount != null && cart.totalPriceAfterDiscount < (cartTotal) && (
                <div className="flex justify-between text-green-600">
                  <span>الخصم</span>
                  <span>-{(cart.cartTotal || cart.totalCartPrice) - cart.totalPriceAfterDiscount} {t('products.egp')}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-makka-cocoa text-lg border-t border-makka-sand pt-2">
                <span>{t('cart.total')}</span>
                <span className="text-makka-brown">{cartTotal} {t('products.egp')}</span>
              </div>
            </div>

            <p className="text-xs text-makka-cocoa/60 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              {t('checkout.payOnDelivery')}
            </p>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-makka-brown text-white font-medium hover:bg-makka-cocoa hover:shadow-glow disabled:opacity-50 transition-all duration-200"
            >
              {submitting ? t('checkout.submitting') : t('checkout.confirmOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
