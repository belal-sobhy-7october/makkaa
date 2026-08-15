import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, CheckCircle, Truck, Clock } from 'lucide-react';
import { endpoints } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import LoadingSpinner from '../components/LoadingSpinner';

const statusConfig = {
  pending: { label: 'قيد الانتظار', color: 'bg-amber-50 text-amber-700', icon: Clock },
  confirmed: { label: 'تم التأكيد', color: 'bg-blue-50 text-blue-700', icon: CheckCircle },
  preparing: { label: 'قيد التحضير', color: 'bg-indigo-50 text-indigo-700', icon: Clock },
  out_for_delivery: { label: 'خرج للتوصيل', color: 'bg-purple-50 text-purple-700', icon: Truck },
  delivered: { label: 'تم التوصيل', color: 'bg-green-50 text-green-700', icon: Truck },
  cancelled: { label: 'ملغي', color: 'bg-red-50 text-red-700', icon: Package },
};

export default function Orders() {
  const { t, locale } = useLanguage();
  usePageTitle(t('orders.title'));
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    endpoints.orders.list()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (!isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/30" />
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa mb-2">{t('orders.title')}</h1>
        <p className="text-makka-cocoa/70 mb-6">سجل الدخول لعرض طلباتك</p>
        <Link to="/login" state={{ from: { pathname: '/orders' } }} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
          {t('nav.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-makka-cocoa mb-8">{t('orders.title')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-makka-cocoa/20" />
          <p className="text-makka-cocoa/70 mb-6">لا توجد طلبات بعد</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-makka-brown text-white hover:bg-makka-cocoa transition-colors">
            {t('home.browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const StatusIcon = statusConfig[o.status]?.icon || Package;
            return (
              <div key={o._id} className="bg-white rounded-2xl border border-makka-sand shadow-soft overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-makka-sand/10 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${statusConfig[o.status]?.color || 'bg-gray-50 text-gray-700'}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[o.status]?.label || o.status}
                    </div>
                    <div className="text-sm text-makka-cocoa/70">
                      {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-makka-brown">{o.totalOrderPrice} ج.م</span>
                    {expandedId === o._id ? <ChevronUp className="w-5 h-5 text-makka-cocoa/50" /> : <ChevronDown className="w-5 h-5 text-makka-cocoa/50" />}
                  </div>
                </button>
                {expandedId === o._id && (
                  <div className="border-t border-makka-sand px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-makka-cocoa/60">العنوان</p>
                        <p className="text-makka-cocoa">{o.shippingAddress?.details || '—'}</p>
                      </div>
                      <div>
                        <p className="text-makka-cocoa/60">الهاتف</p>
                        <p className="text-makka-cocoa" dir="ltr">{o.shippingAddress?.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(o.cartItems || []).map((item) => (
                        <div key={item._id} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-lg bg-makka-sand/30 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.product?.image ? (
                              <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg opacity-40">🧁</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-makka-cocoa line-clamp-1">{item.product?.title || '—'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-makka-cocoa">{item.quantity} × {item.price} ج.م</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {o.isPaid && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مدفوع</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
