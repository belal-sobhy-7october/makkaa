import { useState, useEffect, Fragment } from 'react';
import { endpoints } from '../../api/axios';
import { Loader2, ChevronDown, ChevronUp, CheckCircle, Truck } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    endpoints.orders
      .list()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleMarkPaid = async (id) => {
    try {
      await endpoints.orders.markPaid(id);
      loadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'فشل تأكيد الدفع');
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      await endpoints.orders.markDelivered(id);
      loadOrders();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'فشل تأكيد التوصيل');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-makka-brown" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa">الطلبات</h1>
      </div>

      <div className="rounded-xl bg-white border border-makka-sand shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[700px]">
            <thead className="bg-makka-sand/30">
              <tr>
                <th className="p-3 text-makka-cocoa font-medium">رقم الطلب</th>
                <th className="p-3 text-makka-cocoa font-medium">التاريخ</th>
                <th className="p-3 text-makka-cocoa font-medium">العميل</th>
                <th className="p-3 text-makka-cocoa font-medium">الإجمالي</th>
                <th className="p-3 text-makka-cocoa font-medium">حالة الدفع</th>
                <th className="p-3 text-makka-cocoa font-medium">حالة التوصيل</th>
                <th className="p-3 text-makka-cocoa font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o._id}>
                  <tr
                    className="border-t border-makka-sand cursor-pointer hover:bg-makka-sand/10 transition-colors"
                    onClick={() => toggleExpand(o._id)}
                  >
                    <td className="p-3 flex items-center gap-1">
                      {expandedId === o._id ? (
                        <ChevronUp className="w-4 h-4 text-makka-brown" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-makka-brown" />
                      )}
                      <span>{o._id.slice(0, 8)}</span>
                    </td>
                    <td className="p-3">{formatDate(o.createdAt)}</td>
                    <td className="p-3">{o.user?.name || '—'}</td>
                    <td className="p-3">{o.totalOrderPrice} ج.م</td>
                    <td className="p-3">
                      {o.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <CheckCircle className="w-3 h-3" /> مدفوع
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                          غير مدفوع
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {o.isDelivered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <Truck className="w-3 h-3" /> تم التوصيل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          قيد التوصيل
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {!o.isPaid && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPaid(o._id);
                          }}
                          className="text-makka-brown text-sm hover:underline ml-2"
                        >
                          تأكيد الدفع
                        </button>
                      )}
                      {!o.isDelivered && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkDelivered(o._id);
                          }}
                          className="text-makka-brown text-sm hover:underline"
                        >
                          تأكيد التوصيل
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === o._id && (
                    <tr className="bg-makka-sand/10">
                      <td colSpan={7} className="p-4">
                        <div className="rounded-lg border border-makka-sand bg-white overflow-hidden">
                          <table className="w-full text-right text-sm">
                            <thead className="bg-makka-sand/30">
                              <tr>
                                <th className="p-2 text-makka-cocoa font-medium">المنتج</th>
                                <th className="p-2 text-makka-cocoa font-medium">الكمية</th>
                                <th className="p-2 text-makka-cocoa font-medium">السعر</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.cartItems.map((item) => (
                                <tr key={item._id} className="border-t border-makka-sand">
                                  <td className="p-2">{item.product?.title || '—'}</td>
                                  <td className="p-2">{item.quantity}</td>
                                  <td className="p-2">{item.price} ج.م</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(!o.cartItems || o.cartItems.length === 0) && (
                            <p className="p-3 text-makka-cocoa/70">لا توجد منتجات</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="p-6 text-makka-cocoa/70">لا توجد طلبات بعد.</p>
        )}
      </div>
    </div>
  );
}
