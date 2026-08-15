import { useState, useEffect } from 'react';
import { endpoints } from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', nameAr: '', image: null };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const load = () => {
    setLoading(true);
    endpoints.categories.list({ limit: 100 })
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const getErrorMessage = (err) => {
    if (!err.response) return err.message || 'تحقق من الاتصال أو حاول لاحقاً.';
    const data = err.response.data;
    const msg = data?.message || data?.error?.message;
    if (msg) {
      if (msg.includes('duplicate') || msg.includes('Duplicate')) return 'هذا الاسم مستخدم مسبقاً. اختاري اسماً آخر.';
      return msg;
    }
    return 'فشل الحفظ. جرّبي مرة أخرى.';
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name || '', nameAr: c.nameAr || '', image: null });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setSubmitting(true);
    try {
      if (editingId) {
        await endpoints.categories.update(editingId, form);
        setMessage('تم تحديث التصنيف بنجاح');
      } else {
        await endpoints.categories.create(form);
        setMessage('تمت الإضافة بنجاح');
      }
      resetForm();
      setShowForm(false);
      load();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا التصنيف؟ (لازم ميكونش فيه منتجات مرتبطة به)')) return;
    try {
      await endpoints.categories.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'فشل الحذف');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[200px]" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa">التصنيفات</h1>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa"
        >
          {showForm ? 'إلغاء' : 'إضافة تصنيف'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white border border-makka-sand shadow-card mb-6">
          <h2 className="font-medium text-makka-cocoa mb-4">{editingId ? 'تعديل التصنيف' : 'تصنيف جديد'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الاسم (إنجليزي) — 3 أحرف على الأقل</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                minLength={3}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
                placeholder="Occasion Cakes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الاسم (عربي)</label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
                placeholder="تورتات المناسبات"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-makka-cocoa mb-1">
                صورة التصنيف {editingId ? '(اتركيها فارغة للاحتفاظ بالصورة الحالية)' : '(اختياري)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">
              {message}
            </p>
          )}
          <button type="submit" disabled={submitting} className="mt-4 px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa disabled:opacity-50">
            {submitting ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'حفظ'}
          </button>
        </form>
      )}

      {message && !showForm && (
        <p className={`mb-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">{message}</p>
      )}

      <div className="rounded-xl bg-white border border-makka-sand shadow-card overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-makka-sand/30">
            <tr>
              <th className="p-3 text-makka-cocoa font-medium">الصورة</th>
              <th className="p-3 text-makka-cocoa font-medium">الاسم</th>
              <th className="p-3 text-makka-cocoa font-medium">الاسم العربي</th>
              <th className="p-3 text-makka-cocoa font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-t border-makka-sand">
                <td className="p-3">
                  {c.image ? (
                    <img src={c.image} alt="" className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-makka-sand/50 text-xs">🍰</span>
                  )}
                </td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.nameAr || '—'}</td>
                <td className="p-3 whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(c)} className="text-makka-brown text-sm hover:underline ml-3">تعديل</button>
                  <button type="button" onClick={() => handleDelete(c._id)} className="text-red-600 text-sm hover:underline">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="p-6 text-makka-cocoa/70">لا توجد تصنيفات. أضيفي تصنيفاً جديداً.</p>}
      </div>
    </div>
  );
}
