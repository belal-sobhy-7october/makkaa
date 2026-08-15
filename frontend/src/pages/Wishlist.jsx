import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Wishlist() {
  const { t, locale } = useLanguage();
  usePageTitle(t('wishlist.title'));
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart, fetchCart } = useCart();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    endpoints.wishlist.list()
      .then((res) => setItems(res.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const handleRemove = async (productId) => {
    try {
      await endpoints.wishlist.remove(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch (_) {}
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/wishlist' } } });
      return;
    }
    setAddingId(product._id);
    try {
      await addToCart(product._id, '', product.price);
      fetchCart();
      toast.show(t('common.addToCartSuccess'));
    } catch (err) {
      toast.show(err?.response?.data?.message || t('common.addToCartError'), 'error');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('wishlist.title')}</h1>
        <p className="text-makka-cocoa/70 mb-6">سجل الدخول لعرض المفضلة</p>
        <Link to="/login" state={{ from: { pathname: '/wishlist' } }} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-8">{t('wishlist.title')}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/20" />
          <p className="text-makka-cocoa/70 mb-6">{t('wishlist.empty')}</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
            {t('wishlist.browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((p) => (
            <div key={p._id} className="group bg-white rounded-2xl border border-makka-sand shadow-soft hover:shadow-card-hover overflow-hidden transition-all duration-300">
              <Link to={`/products/${p._id}`} className="block">
                <div className="aspect-square bg-makka-sand/20 flex items-center justify-center overflow-hidden">
                  {p.imageCover ? (
                    <img src={p.imageCover} alt={isAr ? p.titleAr : p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-5xl opacity-30">🧁</span>
                  )}
                </div>
              </Link>
              <div className="p-3">
                <Link to={`/products/${p._id}`}>
                  <h3 className="font-medium text-makka-cocoa text-sm line-clamp-2 mb-1">{isAr ? p.titleAr || p.title : p.title}</h3>
                </Link>
                <p className="text-makka-brown font-semibold mb-2">{p.priceAfterDiscount ?? p.price} {t('products.egp')}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    disabled={addingId === p._id}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-makka-brown text-white text-xs font-medium hover:bg-makka-cocoa disabled:opacity-50 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {addingId === p._id ? '...' : t('productDetail.addToCart')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(p._id)}
                    className="p-2 rounded-xl border border-makka-sand text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={t('wishlist.remove')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
