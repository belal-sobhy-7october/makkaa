import { useState, useEffect } from 'react';
import { endpoints } from '../../api/axios';
import { Tag, Trash2, Plus, Loader2 } from 'lucide-react';

const emptyForm = { name: '', discount: '', expireAt: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadCoupons = () => {
    setLoading(true);
    endpoints.coupons
      .list()
      .then((res) => setCoupons(res.data.data || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setSubmitting(true);
    try {
      await endpoints.coupons.create({
        name: form.name,
        discount: Number(form.discount),
        expireAt: new Date(form.expireAt).toISOString(),
      });
      setMessage('تمت إضافة الكوبون بنجاح');
      resetForm();
      loadCoupons();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setIsError(true);
      const data = err.response?.data;
      setMessage(data?.message || err.message || 'فشل إضافة الكوبون');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا الكوبون؟')) return;
    try {
      await endpoints.coupons.delete(id);
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'فشل الحذف');
    }
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
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa">الكوبونات</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'إلغاء' : 'إضافة كوبون'}
        </button>
      </div>

      {message && !showForm && (
        <p className={`mb-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">
          {message}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white border border-makka-sand shadow-card mb-6">
          <h2 className="font-medium text-makka-cocoa mb-4">كوبون جديد</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الاسم *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
                placeholder="مثال: WELCOME10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الخصم (%) *</label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                required
                min={0}
                max={100}
                step="0.01"
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">تاريخ الانتهاء *</label>
              <input
                type="date"
                value={form.expireAt}
                onChange={(e) => setForm((f) => ({ ...f, expireAt: e.target.value }))}
                required
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa disabled:opacity-50"
          >
            {submitting ? 'جاري الحفظ...' : 'حفظ الكوبون'}
          </button>
        </form>
      )}

      <div className="rounded-xl bg-white border border-makka-sand shadow-card overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-makka-sand/30">
            <tr>
              <th className="p-3 text-makka-cocoa font-medium">
                <Tag className="w-4 h-4 inline ml-1" />
                الاسم
              </th>
              <th className="p-3 text-makka-cocoa font-medium">الخصم</th>
              <th className="p-3 text-makka-cocoa font-medium">تاريخ الانتهاء</th>
              <th className="p-3 text-makka-cocoa font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-t border-makka-sand">
                <td className="p-3 font-medium text-makka-brown">{c.name}</td>
                <td className="p-3">{c.discount}%</td>
                <td className="p-3">{new Date(c.expireAt).toLocaleDateString('ar-EG')}</td>
                <td className="p-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleDelete(c._id)}
                    className="flex items-center gap-1 text-red-600 text-sm hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-6 text-makka-cocoa/70">لا توجد كوبونات. أضف كوبوناً جديداً.</p>}
      </div>
    </div>
  );
}
