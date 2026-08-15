import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowLeft, CheckCircle, Truck, Clock } from 'lucide-react';
import { endpoints } from '../api/axios';
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

export default function OrderDetail() {
  const { id } = useParams();
  const { t, locale } = useLanguage();
  usePageTitle('تفاصيل الطلب');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    endpoints.orders.get(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => setError(err?.response?.data?.message || 'الطلب غير موجود'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner className="min-h-[50vh]" />;

  if (error || !order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'الطلب غير موجود'}</p>
        <Link to="/orders" className="text-makka-brown hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('orders.title')}
        </Link>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Package;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-makka-brown hover:text-makka-gold transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('orders.title')}
      </Link>

      <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="font-display text-xl font-semibold text-makka-cocoa">طلب #{order._id?.slice(0, 8)}</h1>
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${statusConfig[order.status]?.color || 'bg-gray-50 text-gray-700'}`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig[order.status]?.label || order.status}
          </div>
        </div>
        <p className="text-sm text-makka-cocoa/60">{formatDate(order.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
          <h2 className="font-medium text-makka-cocoa mb-3">عنوان التوصيل</h2>
          <p className="text-sm text-makka-cocoa/80">{order.shippingAddress?.details || '—'}</p>
          <p className="text-sm text-makka-cocoa/60" dir="ltr">{order.shippingAddress?.phone || '—'}</p>
          {order.shippingAddress?.city && <p className="text-sm text-makka-cocoa/60">{order.shippingAddress.city}</p>}
        </div>
        <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
          <h2 className="font-medium text-makka-cocoa mb-3">حالة الطلب</h2>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between"><span className="text-makka-cocoa/60">الدفع</span><span className={order.isPaid ? 'text-green-600' : 'text-amber-600'}>{order.isPaid ? 'مدفوع' : 'غير مدفوع'}</span></p>
            <p className="flex justify-between"><span className="text-makka-cocoa/60">التوصيل</span><span className={order.isDelivered ? 'text-green-600' : 'text-amber-600'}>{order.isDelivered ? 'تم التوصيل' : 'قيد التوصيل'}</span></p>
            <p className="flex justify-between font-semibold text-makka-brown border-t border-makka-sand pt-1 mt-1">
              <span>الإجمالي</span><span>{order.totalOrderPrice} ج.م</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-makka-sand shadow-soft p-6">
        <h2 className="font-medium text-makka-cocoa mb-4">المنتجات</h2>
        <div className="space-y-3">
          {(order.cartItems || []).map((item) => (
            <div key={item._id} className="flex items-center gap-3 text-sm">
              <div className="w-14 h-14 rounded-xl bg-makka-sand/30 overflow-hidden shrink-0 flex items-center justify-center">
                {item.product?.image ? (
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-40">🧁</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-makka-cocoa">{item.product?.title || '—'}</p>
                <p className="text-makka-cocoa/60">{item.quantity} × {item.price} ج.م</p>
              </div>
              <p className="font-semibold text-makka-brown">{item.quantity * item.price} ج.م</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
