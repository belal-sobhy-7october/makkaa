# مكة للحلواني — التحويل من Laresa (Mongo) إلى Supabase (Postgres)

## محتوى المجلد

```
db/
  schema.sql   ← السكيما كاملة (جداول + RLS + دوال) — تتشغل مرة واحدة في Supabase
  seed.sql     ← تصنيفات وتصنيفات فرعية أولية لمكة للحلواني
frontend/
  .env.example
  index.html
  package.json
  src/api/supabaseClient.js   ← عميل Supabase
  src/api/supabase.js         ← كل استدعاءات الداتابيز (بديل الـ API القديم)
  src/api/axios.js            ← "شيم" بيحافظ على نفس مسار الاستيراد القديم
  src/utils/slugify.js
  src/context/AuthContext.jsx
  src/context/CartContext.jsx
  src/components/Layout.jsx
  src/i18n/translations.js
```

## خطوات التركيب بالترتيب

### 1) نسخ الملفات على مشروعك
انسخي كل ملف لمكانه الصحيح في مشروع الفرونت (استبدال الموجود بنفس الاسم).
`db/*.sql` مش بتتحط في الفرونت، دي بس بتتشغل جوه Supabase مباشرة.

### 2) تركيب المكتبة
```bash
npm install
```
(اتضافت `@supabase/supabase-js` في `package.json`)

### 3) متغيرات البيئة
اعملي ملف `.env` في `frontend/` (زي `.env.example`) وحطي فيه:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 4) تشغيل السكيما في Supabase
SQL Editor → الصقي `db/schema.sql` كامل → Run
بعدين الصقي `db/seed.sql` → Run

### 5) تفعيل أول أدمن
سجّلي حساب من صفحة "إنشاء حساب" بالموقع، بعدين في SQL Editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'ايميلك@هنا.com');
```

---

## المطلوب منك في سوبابيز بالتفصيل (checklist)

- [ ] إنشاء المشروع في supabase.com ونسخ `Project URL` و `anon public key`
- [ ] تشغيل `schema.sql` كامل من غير أخطاء (لو فيه error ابعتيه)
- [ ] تشغيل `seed.sql`
- [ ] Authentication → Providers → تأكيد إن Email مفعّل
- [ ] Authentication → URL Configuration → إضافة رابط الموقع (localhost:5173 دلوقتي، والدومين الحقيقي بعدين) في Site URL و Redirect URLs
- [ ] Storage → التأكد إن `products` و `categories` buckets موجودين و Public (بيتعملوا تلقائي من السكيما)
- [ ] تسجيل حساب عادي من الموقع، وترقيته لـ admin بالكويري اللي فوق
- [ ] (اختياري) إضافة كوبونات من SQL Editor:
  ```sql
  insert into public.coupons (name, discount, expire_at)
  values ('MAKKA10', 10, now() + interval '30 days');
  ```
- [ ] عدم مشاركة `service_role key` في أي كود فرونت أبداً (احنا مش مستخدمينه أصلاً، شغالين بالـ anon key + RLS بس)

---

## إيه اللي اتصلح في النسخة دي بالذات (مهم)

Supabase بيرجع أعمدة بصيغة `snake_case` (`image_cover`, `name_ar`...) والمفتاح الأساسي اسمه `id`،
لكن كل صفحات الفرونت (Products.jsx, Cart.jsx, ProductDetail.jsx...) متبنية من الأصل على `camelCase`
و `_id` (زي ما كانت شغالة مع MongoDB). لو المشكلة دي متتصلحش، الموقع كان هيرجّع بيانات فاضية
أو `undefined` في كل مكان.

اتعمل مترجم تلقائي (`camelizeWithId`) جوه `src/api/supabase.js` بيحول أي نتيجة راجعة من الداتابيز
لنفس الشكل اللي الصفحات القديمة متوقعاه، فمعظم الصفحات هتشتغل من غير ما تتلمس خالص.

كمان اتصلح باگ في السلة: مقارنة "لا يوجد حجم/لون" (`variant IS NULL`) كانت بتتكتب غلط
(`.eq('variant', null)` بدل `.is('variant', null)`) وده كان هيمنع إضافة نفس المنتج للسلة تاني.

## حاجات لسه محتاجة شغل (في مرحلة الـ UI/UX الجاية)

- تعديل المنتج (Edit) في لوحة الأدمن — مكانش موجود أصلاً في المشروع الأصلي، هنضيفه.
- اختيار "الحجم" للتورتات (عمود `sizes` جاهز في الداتابيز، الواجهة لسه مش مستخدماه).
- الدفع الإلكتروني (Stripe) — متشال مؤقتاً، السيستم دلوقتي "كاش عند الاستلام" بس.
- صفحة إضافة تقييم على المنتج (الجدول والـ API جاهزين، الفورم لسه مش موجود في الواجهة).

---

## ✅ Checklist — عملنا إيه لحد دلوقتي بالظبط

### قاعدة البيانات (Supabase) — مكتمل 100%
- [x] `db/schema.sql` — كل الجداول + RLS + الدوال (profiles, categories, subcategories, products, reviews, wishlist, addresses, coupons, carts/cart_items, orders/order_items) + Storage buckets
- [x] `db/seed.sql` — تصنيفات وتصنيفات فرعية مكة للحلواني

### طبقة الربط (API layer) — مكتمل 100%
- [x] `supabaseClient.js` — عميل Supabase
- [x] `supabase.js` — كل استدعاءات الداتابيز (categories, subcategories, products, users, addresses, wishlist, cart, orders, **coupons**)
- [x] `axios.js` — شيم للحفاظ على مسار الاستيراد القديم
- [x] مترجم `camelizeWithId` تلقائي (بيحل مشكلة snake_case/id مقابل camelCase/_id) — أهم إصلاح حصل
- [x] إصلاح باگ مقارنة `variant IS NULL` في السلة
- [x] دعم سعر مخصص عند اختيار حجم التورتة (`cart.add` بياخد `price` اختياري)
- [x] `orders.markPaid` / `orders.markDelivered` (عبر RPC، أدمن/مدير فقط)
- [x] `coupons.list` / `coupons.create` / `coupons.delete`

### Contexts
- [x] `AuthContext.jsx` — معاد كتابته بالكامل على Supabase Auth (بدل localStorage tokens اليدوي)
- [x] `CartContext.jsx` — معاد كتابته بالكامل، وبياخد سعر الحجم المختار

### صفحات العميل
- [x] `ProductDetail.jsx` — **معاد كتابتها بالكامل**: اختيار حجم التورتة (بدل الألوان)، بادج "يحتاج حجز مسبق"، **فورم تقييم حقيقي شغال** (بيبعت للداتابيز ويحدّث متوسط التقييم أوتوماتيك عبر تريجر)
- [ ] باقي صفحات العميل (Home, Products, Categories, Cart, Checkout, Orders, Profile...) — **شغالة زي ما هي بدون تعديل** لأن طبقة الـ API متوافقة معاها، بس لسه ما اتلمستش لإضافة أي تحسين (هيتلمسوا في مرحلة الـ UI/UX)

### لوحة الأدمن
- [x] `AdminProducts.jsx` — **معاد كتابتها بالكامل**: إضافة + **تعديل (كان ناقص من الأصل)** + حذف + اختيار تصنيف فرعي + إدخال أحجام متعددة بالسعر لكل حجم + خانة "يحتاج حجز مسبق"
- [x] `AdminCategories.jsx` — **معاد كتابتها بالكامل**: إضافة + **تعديل** + رفع صورة للتصنيف + حذف
- [ ] `AdminOrders.jsx` — **لسه ماتعملتش** (صفحة عرض كل الطلبات + زرار "تم الدفع"/"تم التوصيل" — الـ API جاهز `orders.markPaid/markDelivered` بس الصفحة نفسها لأ)
- [ ] `AdminCoupons.jsx` — **لسه ماتعملتش** (صفحة إضافة/حذف كوبونات — الـ API جاهز `coupons.*` بس الصفحة نفسها لأ)
- [ ] تحديث `AdminLayout.jsx` — لازم نضيف روابط "الطلبات" و"الكوبونات" في القائمة الجانبية
- [ ] تحديث `App.jsx` — لازم نضيف الـ routes بتاعة `/admin/orders` و `/admin/coupons`

### باقي (تم شرحه فوق، مش هيتعمل دلوقتي)
- [ ] الدفع الإلكتروني (Stripe)
- [ ] أي تعديل في الشكل/التصميم (UI/UX) — مقرر يتعمل بعد كده

**يعني باقي 4 حاجات بس عشان لوحة الأدمن تبقى كاملة 100%**: صفحة الطلبات، صفحة الكوبونات، وربطهم في القائمة والراوتس. شغال عليهم دلوقتي.

