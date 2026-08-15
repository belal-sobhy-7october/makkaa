import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const { t, locale } = useLanguage();
  usePageTitle(t('cart.title'));
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { cart, cartCount, cartTotal, loading, updateQuantity, removeItem, applyCoupon } = useCart();
  const [couponValue, setCouponValue] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [applying, setApplying] = useState(false);
  const isAr = locale === 'ar';

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('cart.title')}</h1>
        <p className="text-makka-cocoa/70 mb-6">{t('cart.loginRequired')}</p>
        <Link
          to="/login"
          state={{ from: { pathname: '/cart' } }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors"
        >
          {t('cart.login')}
        </Link>
      </div>
    );
  }

  if (!cart || cartCount === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('cart.empty')}</h1>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('cart.browseProducts')}
        </Link>
      </div>
    );
  }

  const items = cart.cartItems || [];

  const handleApplyCoupon = async () => {
    if (!couponValue.trim()) return;
    setApplying(true);
    setCouponMsg('');
    setCouponError(false);
    try {
      await applyCoupon(couponValue.trim());
      setCouponMsg(t('common.couponApplied'));
      setCouponValue('');
    } catch (err) {
      setCouponError(true);
      setCouponMsg(err?.response?.data?.message || t('common.couponInvalid'));
    } finally {
      setApplying(false);
    }
  };

  const hasDiscount = cart.totalPriceAfterDiscount != null && cart.totalPriceAfterDiscount < cart.totalCartPrice;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const prod = item.product || {};
            const itemTotal = item.price * item.quantity;
            return (
              <div key={item._id} className="flex gap-4 p-4 bg-white rounded-2xl border border-makka-sand shadow-soft">
                <Link to={`/products/${prod._id}`} className="shrink-0 w-20 h-20 rounded-xl bg-makka-sand/30 overflow-hidden flex items-center justify-center">
                  {prod.imageCover ? (
                    <img src={prod.imageCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">🧁</span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${prod._id}`} className="font-medium text-makka-cocoa hover:text-makka-brown transition-colors line-clamp-1">
                    {isAr ? prod.titleAr || prod.title : prod.title}
                  </Link>
                  {item.color && <p className="text-xs text-makka-cocoa/60 mt-0.5">{t('productDetail.color')}: {item.color}</p>}
                  <p className="text-makka-brown font-semibold mt-1">{item.price} {t('products.egp')}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-makka-sand rounded-lg">
                      <button
                        type="button"
                        onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 hover:bg-makka-sand/30 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm font-medium text-makka-cocoa min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-makka-sand/30 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={t('cart.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className="font-semibold text-makka-cocoa">{itemTotal} {t('products.egp')}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-makka-sand pb-4">
              <Tag className="w-5 h-5 text-makka-gold" />
              <h3 className="font-medium text-makka-cocoa">{t('cart.coupon')}</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponValue}
                onChange={(e) => setCouponValue(e.target.value)}
                placeholder={t('cart.coupon')}
                className="flex-1 rounded-xl border border-makka-sand px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={applying || !couponValue.trim()}
                className="px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa disabled:opacity-50 transition-colors"
              >
                {applying ? '...' : t('cart.apply')}
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs ${couponError ? 'text-red-600' : 'text-green-600'}`}>{couponMsg}</p>
            )}

            <div className="border-t border-makka-sand pt-4 space-y-2">
              <div className="flex justify-between text-sm text-makka-cocoa/80">
                <span>{t('cart.total')}</span>
                <span>{cart.totalCartPrice} {t('products.egp')}</span>
              </div>
              {hasDiscount && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>الخصم</span>
                  <span>-{cart.totalCartPrice - cart.totalPriceAfterDiscount} {t('products.egp')}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-makka-cocoa text-lg border-t border-makka-sand pt-2">
                <span>{t('cart.total')}</span>
                <span className="text-makka-brown">{cartTotal} {t('products.egp')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3 rounded-xl bg-makka-brown text-white font-medium hover:bg-makka-cocoa hover:shadow-glow transition-all duration-200"
            >
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
