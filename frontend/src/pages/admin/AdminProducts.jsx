import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  quantity: '',
  category: '',
  subcategory: '',
  requiresPreorder: false,
  imageCover: null,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [sizes, setSizes] = useState([]); // [{label, price}]
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const getErrorMessage = (err) => {
    const data = err.response?.data;
    if (data?.errors?.length) return data.errors.map((e) => e.msg).join('؛ ');
    return err?.message || data?.message || 'فشل الحفظ';
  };

  const loadProducts = () => {
    endpoints.products.list({ limit: 100 })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      endpoints.products.list({ limit: 100 }),
      endpoints.categories.list({ limit: 100 }),
    ])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.data || []);
        setCategories(cRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!form.category) {
      setSubcategories([]);
      return;
    }
    endpoints.subcategories.list({ category: form.category }).then((res) => setSubcategories(res.data.data || []));
  }, [form.category]);

  const resetForm = () => {
    setForm(emptyForm);
    setSizes([]);
    setEditingId(null);
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      quantity: p.quantity ?? '',
      category: p.category?._id || p.categoryId || '',
      subcategory: p.subcategoryId || '',
      requiresPreorder: !!p.requiresPreorder,
      imageCover: null,
    });
    setSizes(Array.isArray(p.sizes) ? p.sizes : []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addSizeRow = () => setSizes((s) => [...s, { label: '', price: '' }]);
  const updateSizeRow = (idx, field, value) => {
    setSizes((s) => s.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };
  const removeSizeRow = (idx) => setSizes((s) => s.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    if (!form.category) {
      setIsError(true);
      setMessage('اختر التصنيف');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('price', String(form.price));
      fd.append('quantity', String(form.quantity));
      fd.append('category', form.category);
      fd.append('subcategory', form.subcategory || '');
      fd.append('requiresPreorder', String(form.requiresPreorder));
      const cleanSizes = sizes.filter((s) => s.label && s.price !== '');
      if (cleanSizes.length > 0) {
        fd.append('sizes', JSON.stringify(cleanSizes.map((s) => ({ label: s.label, price: Number(s.price) }))));
      }
      if (form.imageCover instanceof File) fd.append('imageCover', form.imageCover);

      if (editingId) {
        await endpoints.products.update(editingId, fd);
        setMessage('تم تحديث المنتج بنجاح');
      } else {
        await endpoints.products.create(fd);
        setMessage('تمت إضافة المنتج بنجاح');
      }
      resetForm();
      setShowForm(false);
      loadProducts();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('حذف هذا المنتج؟')) return;
    try {
      await endpoints.products.delete(id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'فشل الحذف');
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[200px]" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-makka-cocoa">المنتجات</h1>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa"
        >
          {showForm ? 'إلغاء' : 'إضافة منتج'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-white border border-makka-sand shadow-card mb-6">
          <h2 className="font-medium text-makka-cocoa mb-4">{editingId ? 'تعديل المنتج' : 'منتج جديد'}</h2>
          {categories.length === 0 && (
            <p className="mb-4 p-3 rounded-lg bg-amber-50 text-amber-800 text-sm">أضيفي تصنيفاً واحداً على الأقل قبل إضافة منتج.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">اسم المنتج *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">التصنيف *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: '' }))}
                required
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              >
                <option value="">اختر التصنيف</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.nameAr || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">التصنيف الفرعي (اختياري)</label>
              <select
                value={form.subcategory}
                onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
                disabled={!form.category}
                className="w-full rounded-lg border border-makka-sand px-3 py-2 disabled:bg-makka-sand/20"
              >
                <option value="">بدون</option>
                {subcategories.map((s) => (
                  <option key={s._id} value={s._id}>{s.nameAr || s.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.requiresPreorder}
                onChange={(e) => setForm((f) => ({ ...f, requiresPreorder: e.target.checked }))}
                className="rounded border-makka-sand"
              />
              <span className="text-sm text-makka-cocoa">يحتاج حجز مسبق (مناسبات)</span>
            </label>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الوصف * (20 حرفاً على الأقل)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                minLength={20}
                rows={3}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">السعر الأساسي *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min={0}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-makka-cocoa mb-1">الكمية المتاحة *</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                required
                min={0}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-makka-cocoa mb-1">
                صورة الغلاف {editingId ? '(اتركها فارغة للاحتفاظ بالصورة الحالية)' : '(اختياري)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((f) => ({ ...f, imageCover: e.target.files?.[0] || null }))}
                className="w-full rounded-lg border border-makka-sand px-3 py-2"
              />
            </div>

            <div className="md:col-span-2 border-t border-makka-sand pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-makka-cocoa">
                  أحجام متعددة (اختياري — مفيد لتورتات المناسبات)
                </label>
                <button type="button" onClick={addSizeRow} className="text-sm text-makka-brown hover:underline">
                  + إضافة حجم
                </button>
              </div>
              {sizes.map((s, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="مثال: 1 كجم"
                    value={s.label}
                    onChange={(e) => updateSizeRow(idx, 'label', e.target.value)}
                    className="flex-1 rounded-lg border border-makka-sand px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="السعر"
                    value={s.price}
                    onChange={(e) => updateSizeRow(idx, 'price', e.target.value)}
                    className="w-32 rounded-lg border border-makka-sand px-3 py-2 text-sm"
                  />
                  <button type="button" onClick={() => removeSizeRow(idx)} className="text-red-600 text-sm px-2">حذف</button>
                </div>
              ))}
            </div>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">{message}</p>
          )}
          <button type="submit" disabled={submitting} className="mt-4 px-4 py-2 rounded-xl bg-makka-brown text-white text-sm hover:bg-makka-cocoa disabled:opacity-50">
            {submitting ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'حفظ المنتج'}
          </button>
        </form>
      )}

      {message && !showForm && (
        <p className={`mb-4 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`} role="alert">{message}</p>
      )}

      <div className="rounded-xl bg-white border border-makka-sand shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[600px]">
            <thead className="bg-makka-sand/30">
              <tr>
                <th className="p-3 text-makka-cocoa font-medium">الصورة</th>
                <th className="p-3 text-makka-cocoa font-medium">الاسم</th>
                <th className="p-3 text-makka-cocoa font-medium">السعر</th>
                <th className="p-3 text-makka-cocoa font-medium">الكمية</th>
                <th className="p-3 text-makka-cocoa font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-makka-sand">
                  <td className="p-3">
                    {p.imageCover ? (
                      <img src={p.imageCover} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <span className="w-12 h-12 flex items-center justify-center rounded bg-makka-sand/50 text-makka-cocoa/60 text-xs">بدون صورة</span>
                    )}
                  </td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.price} ج.م</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3 space-x-2 space-x-reverse whitespace-nowrap">
                    <Link to={`/products/${p._id}`} className="text-makka-brown text-sm hover:underline ml-2">عرض</Link>
                    <button type="button" onClick={() => startEdit(p)} className="text-makka-brown text-sm hover:underline ml-2">تعديل</button>
                    <button type="button" onClick={() => handleDelete(p._id)} className="text-red-600 text-sm hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && <p className="p-6 text-makka-cocoa/70">لا توجد منتجات. أضيفي منتجاً جديداً.</p>}
      </div>
    </div>
  );
}
