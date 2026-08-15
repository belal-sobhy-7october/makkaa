import { supabase } from './supabaseClient';
import slugify from '../utils/slugify';

/* ============================================================================
 * أدوات تحويل عامة
 * Supabase/Postgres بيرجع snake_case وعمود المفتاح اسمه id.
 * كل صفحات الفرونت (من مشروع Makka الأصلي) متبنية على camelCase و _id.
 * الدالتين دول بيحولوا أي نتيجة راجعة من الداتابيز للشكل اللي الفرونت متوقعه،
 * بشكل متكرر (recursive) حتى لو الكائن متداخل (زي product.category).
 * ========================================================================== */
const toCamelKey = (key) => key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function camelizeWithId(value) {
  if (Array.isArray(value)) return value.map(camelizeWithId);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      out[toCamelKey(k)] = camelizeWithId(v);
    });
    if (Object.prototype.hasOwnProperty.call(out, 'id') && out.id != null) {
      out._id = out.id;
    }
    return out;
  }
  return value;
}

/** يلف أي نتيجة عشان الشكل يفضل زي القديم: res.data.data */
const ok = (data, extra = {}) => ({ data: { data: camelizeWithId(data), ...extra } });

const throwIfError = ({ error }) => {
  if (error) throw error;
};

const applySort = (query, sort, fallback = 'created_at') => {
  if (!sort) return query.order(fallback, { ascending: false });
  const desc = sort.startsWith('-');
  return query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
};

const paginate = (query, { page = 1, limit = 50 } = {}) => {
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  return query.range(from, to);
};

async function uploadImage(bucket, file) {
  if (!file || !(file instanceof File) || file.size === 0) return null;
  const safeName = file.name.replace(/[^\w.\-]+/g, '-');
  const fileName = `${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

/* ============================== Categories ============================== */
const categories = {
  list: async ({ page = 1, limit = 50, sort, keyword } = {}) => {
    let q = supabase.from('categories').select('*', { count: 'exact' });
    if (keyword) q = q.or(`name.ilike.%${keyword}%,name_ar.ilike.%${keyword}%`);
    q = applySort(q, sort || 'sort_order');
    q = paginate(q, { page, limit });
    const { data, error, count } = await q;
    throwIfError({ error });
    return ok(data, {
      results: data.length,
      paginationResult: { currentPage: Number(page), limit: Number(limit), numberOfPages: Math.ceil((count || 0) / limit) },
    });
  },
  get: async (id) => {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    throwIfError({ error });
    return ok(data);
  },
  subcategories: async (categoryId) => {
    const { data, error } = await supabase.from('subcategories').select('*').eq('category_id', categoryId);
    throwIfError({ error });
    return ok(data);
  },
  create: async ({ name, nameAr, image } = {}) => {
    const payload = { name, name_ar: nameAr, slug: slugify(name) };
    if (image instanceof File) payload.image = await uploadImage('categories', image);
    const { data, error } = await supabase.from('categories').insert(payload).select().single();
    throwIfError({ error });
    return ok(data);
  },
  update: async (id, { name, nameAr, image } = {}) => {
    const payload = {};
    if (name) { payload.name = name; payload.slug = slugify(name); }
    if (nameAr !== undefined) payload.name_ar = nameAr;
    if (image instanceof File) payload.image = await uploadImage('categories', image);
    const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
    throwIfError({ error });
    return ok(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    throwIfError({ error });
    return { status: 204 };
  },
};

/* ============================= Subcategories ============================= */
const subcategories = {
  list: async ({ category } = {}) => {
    let q = supabase.from('subcategories').select('*');
    if (category) q = q.eq('category_id', category);
    const { data, error } = await q;
    throwIfError({ error });
    return ok(data);
  },
  get: async (id) => {
    const { data, error } = await supabase.from('subcategories').select('*').eq('id', id).single();
    throwIfError({ error });
    return ok(data);
  },
};

/* =============================== Products ================================ */
const productSelect = '*, category:categories(id,name,name_ar)';

const buildProductsQuery = (params = {}) => {
  const { page = 1, limit = 50, sort, keyword, category } = params;
  let q = supabase.from('products').select(productSelect, { count: 'exact' }).eq('is_active', true);
  if (category) q = q.eq('category_id', category);
  if (keyword) {
    q = q.or(`title.ilike.%${keyword}%,title_ar.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }
  if (params['price[gte]']) q = q.gte('price', params['price[gte]']);
  if (params['price[lte]']) q = q.lte('price', params['price[lte]']);
  q = applySort(q, sort);
  q = paginate(q, { page, limit });
  return q;
};

const products = {
  list: async (params = {}) => {
    const { page = 1, limit = 50 } = params;
    const { data, error, count } = await buildProductsQuery(params);
    throwIfError({ error });
    return ok(data, {
      results: data.length,
      paginationResult: { currentPage: Number(page), limit: Number(limit), numberOfPages: Math.ceil((count || 0) / limit) },
    });
  },
  get: async (id) => {
    const { data, error } = await supabase.from('products').select(productSelect).eq('id', id).single();
    throwIfError({ error });
    return ok(data);
  },
  create: async (formData) => {
    const title = formData.get('title');
    const description = formData.get('description');
    const price = Number(formData.get('price'));
    const quantity = Number(formData.get('quantity'));
    const category = formData.get('category');
    const subcategory = formData.get('subcategory');
    const sizesRaw = formData.get('sizes');
    const requiresPreorder = formData.get('requiresPreorder');
    const file = formData.get('imageCover');
    const imageCoverUrl = await uploadImage('products', file);

    const { data, error } = await supabase
      .from('products')
      .insert({
        title,
        slug: slugify(title),
        description,
        price,
        quantity,
        category_id: category,
        subcategory_id: subcategory || null,
        sizes: sizesRaw ? JSON.parse(sizesRaw) : null,
        requires_preorder: requiresPreorder === 'true',
        image_cover: imageCoverUrl,
      })
      .select()
      .single();
    throwIfError({ error });
    return ok(data);
  },
  update: async (id, formData) => {
    const payload = {};
    if (formData.get('title')) { payload.title = formData.get('title'); payload.slug = slugify(formData.get('title')); }
    if (formData.get('description')) payload.description = formData.get('description');
    if (formData.get('price')) payload.price = Number(formData.get('price'));
    if (formData.get('quantity') !== null && formData.get('quantity') !== '') payload.quantity = Number(formData.get('quantity'));
    if (formData.get('category')) payload.category_id = formData.get('category');
    if (formData.has('subcategory')) payload.subcategory_id = formData.get('subcategory') || null;
    if (formData.has('sizes')) {
      const sizesRaw = formData.get('sizes');
      payload.sizes = sizesRaw ? JSON.parse(sizesRaw) : null;
    }
    if (formData.has('requiresPreorder')) payload.requires_preorder = formData.get('requiresPreorder') === 'true';
    const file = formData.get('imageCover');
    if (file && file.size > 0) payload.image_cover = await uploadImage('products', file);

    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    throwIfError({ error });
    return ok(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    throwIfError({ error });
    return { status: 204 };
  },
  reviews: async (productId) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:profiles(id,name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    throwIfError({ error });
    return ok(data);
  },
  addReview: async (productId, { rating, comment, title }) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('reviews')
      .insert({ product_id: productId, user_id: userData.user.id, rating, comment, title })
      .select()
      .single();
    throwIfError({ error });
    return ok(data);
  },
};

/* ================================ Users =================================== */
const users = {
  getMe: async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    throwIfError({ error: userErr });
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
    throwIfError({ error });
    return ok({ ...data, email: userData.user.email });
  },
  updateMe: async ({ name, phone }) => {
    const { data: userData } = await supabase.auth.getUser();
    const payload = {};
    if (name) { payload.name = name; payload.slug = slugify(name); }
    if (phone !== undefined) payload.phone = phone;
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', userData.user.id).select().single();
    throwIfError({ error });
    return ok(data);
  },
  changePassword: async ({ password }) => {
    const { error } = await supabase.auth.updateUser({ password });
    throwIfError({ error });
    return ok({ success: true });
  },
};

/* =============================== Addresses ================================ */
const addresses = {
  list: async () => {
    const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
    throwIfError({ error });
    return ok(data);
  },
  add: async (payload) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        alias: payload.alias || null,
        details: payload.details,
        phone: payload.phone,
        city: payload.city || null,
        postal_code: payload.postalCode || null,
        user_id: userData.user.id,
      })
      .select()
      .single();
    throwIfError({ error });
    return ok(data);
  },
  remove: async (id) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    throwIfError({ error });
    return { status: 204 };
  },
};

/* =============================== Wishlist ================================== */
const wishlist = {
  list: async () => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('product:products(*)')
      .order('created_at', { ascending: false });
    throwIfError({ error });
    return ok((data || []).map((r) => r.product).filter(Boolean));
  },
  add: async (productId) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('wishlist').insert({ user_id: userData.user.id, product_id: productId });
    throwIfError({ error });
    return ok({ success: true });
  },
  remove: async (productId) => {
    const { error } = await supabase.from('wishlist').delete().eq('product_id', productId);
    throwIfError({ error });
    return ok({ success: true });
  },
};

/* ================================= Cart ===================================== */
async function getOrCreateCart(userId) {
  let { data: c, error } = await supabase.from('carts').select('*').eq('user_id', userId).maybeSingle();
  throwIfError({ error });
  if (!c) {
    const { data: created, error: createErr } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
    throwIfError({ error: createErr });
    c = created;
  }
  return c;
}

async function fetchFullCart(userId) {
  const c = await getOrCreateCart(userId);
  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*, product:products(id,title,title_ar,image_cover,price,quantity)')
    .eq('cart_id', c.id);
  throwIfError({ error });

  const camelItems = camelizeWithId(items || []);

  return {
    _id: c.id,
    cartItems: camelItems.map((it) => ({
      _id: it._id,
      product: it.product,
      quantity: it.quantity,
      color: it.variant,
      price: it.price,
    })),
    totalCartPrice: c.total_cart_price,
    totalPriceAfterDiscount: c.total_price_after_discount,
  };
}

const cart = {
  get: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw { response: { status: 404, data: { message: 'يجب تسجيل الدخول' } } };
    const full = await fetchFullCart(userData.user.id);
    return { data: { status: 'success', numOfCartItems: full.cartItems.length, data: full } };
  },
  add: async ({ productId, color, price }) => {
    const { data: userData } = await supabase.auth.getUser();
    const c = await getOrCreateCart(userData.user.id);
    let finalPrice = price;
    if (finalPrice === undefined || finalPrice === null) {
      const { data: product, error: pErr } = await supabase.from('products').select('price').eq('id', productId).single();
      throwIfError({ error: pErr });
      finalPrice = product.price;
    }

    let existingQuery = supabase.from('cart_items').select('*').eq('cart_id', c.id).eq('product_id', productId);
    existingQuery = color ? existingQuery.eq('variant', color) : existingQuery.is('variant', null);
    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const { error } = await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      throwIfError({ error });
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ cart_id: c.id, product_id: productId, variant: color || null, price: finalPrice });
      throwIfError({ error });
    }
    const full = await fetchFullCart(userData.user.id);
    return { data: { status: 'success', numOfCartItems: full.cartItems.length, data: full } };
  },
  updateItem: async (itemId, { quantity }) => {
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    throwIfError({ error });
    const { data: userData } = await supabase.auth.getUser();
    const full = await fetchFullCart(userData.user.id);
    return { data: { status: 'success', numOfCartItems: full.cartItems.length, data: full } };
  },
  removeItem: async (itemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    throwIfError({ error });
    const { data: userData } = await supabase.auth.getUser();
    const full = await fetchFullCart(userData.user.id);
    return { data: { status: 'success', numOfCartItems: full.cartItems.length, data: full } };
  },
  clear: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const c = await getOrCreateCart(userData.user.id);
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', c.id);
    throwIfError({ error });
    return { status: 204 };
  },
  applyCoupon: async (couponName) => {
    const { error } = await supabase.rpc('apply_coupon_to_cart', { p_coupon_name: couponName });
    if (error) throw { response: { data: { message: 'كوبون غير صالح أو منتهي' } } };
    const { data: userData } = await supabase.auth.getUser();
    const full = await fetchFullCart(userData.user.id);
    return { data: { status: 'success', numOfCartItems: full.cartItems.length, data: full } };
  },
};

/* ================================= Orders ==================================== */
function mapOrder(o) {
  return {
    _id: o.id,
    status: o.status,
    createdAt: o.created_at,
    totalOrderPrice: o.total_order_price,
    isPaid: o.is_paid,
    isDelivered: o.is_delivered,
    shippingAddress: { details: o.shipping_details, phone: o.shipping_phone, city: o.shipping_city },
    user: o.user ? { _id: o.user.id, name: o.user.name } : null,
    cartItems: (o.order_items || []).map((it) => ({
      _id: it.id,
      product: { _id: it.product_id, title: it.title_snapshot, image: it.image_snapshot },
      quantity: it.quantity,
      price: it.price,
    })),
  };
}

const orders = {
  list: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), user:profiles(id,name)')
      .order('created_at', { ascending: false });
    throwIfError({ error });
    return { data: { data: (data || []).map(mapOrder) } };
  },
  get: async (id) => {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
    throwIfError({ error });
    return { data: { data: mapOrder(data) } };
  },
  create: async (_cartId, { shippingAddress }) => {
    const { data, error } = await supabase.rpc('create_order_from_cart', {
      p_details: shippingAddress.details,
      p_phone: shippingAddress.phone,
      p_city: shippingAddress.city || null,
      p_postal_code: shippingAddress.postalCode || null,
    });
    throwIfError({ error });
    return { data: { status: 'success', data } };
  },
  markPaid: async (id) => {
    const { data, error } = await supabase.rpc('mark_order_paid', { p_order_id: id });
    throwIfError({ error });
    return { data: { status: 'success', data: mapOrder(data) } };
  },
  markDelivered: async (id) => {
    const { data, error } = await supabase.rpc('mark_order_delivered', { p_order_id: id });
    throwIfError({ error });
    return { data: { status: 'success', data: mapOrder(data) } };
  },
};

/* ================================= Coupons ==================================== */
const coupons = {
  list: async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    throwIfError({ error });
    return ok(data);
  },
  create: async ({ name, discount, expireAt }) => {
    const { data, error } = await supabase
      .from('coupons')
      .insert({ name, discount: Number(discount), expire_at: expireAt })
      .select()
      .single();
    throwIfError({ error });
    return ok(data);
  },
  delete: async (id) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    throwIfError({ error });
    return { status: 204 };
  },
};

/* ================================== Auth ===================================== */
const auth = {
  signup: async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    throwIfError({ error });
    return { data: { data: { id: data.user?.id, name, email }, token: data.session?.access_token } };
  },
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw { response: { data: { message: 'البريد أو كلمة المرور غير صحيحة' } } };
    return { data: { data: { id: data.user.id, email: data.user.email }, token: data.session.access_token } };
  },
  forgotPassword: async ({ email }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    throwIfError({ error });
    return { data: { status: 'Success' } };
  },
  resetPassword: async ({ newPassword }) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError({ error });
    return { data: { status: 'Success' } };
  },
};

export const endpoints = {
  auth,
  categories,
  subcategories,
  products,
  users,
  addresses,
  wishlist,
  cart,
  orders,
  coupons,
};

export { supabase };
