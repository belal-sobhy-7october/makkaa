-- ============================================================================
-- مكة للحلواني — Seed Data (تصنيفات وتصنيفات فرعية)
-- شغّليه بعد schema.sql
-- ============================================================================

insert into public.categories (name, name_ar, slug, sort_order) values
  ('Occasion Cakes',    'تورتات وكيك المناسبات', 'occasion-cakes',    1),
  ('Oriental Sweets',   'حلويات شرقية',           'oriental-sweets',   2),
  ('Western Pastries',  'حلويات غربية',           'western-pastries',  3),
  ('Ice Cream',         'آيس كريم',               'ice-cream',         4),
  ('Savory Bakery',     'ساليزون (مخبوزات مالحة)', 'savory-bakery',     5),
  ('Offers & Bundles',  'عروض وباقات',            'offers-bundles',    6),
  ('Factory Outlet',    'منتجات منفذ المصنع',     'factory-outlet',    7)
on conflict (name) do nothing;

-- تورتات وكيك المناسبات
insert into public.subcategories (category_id, name, name_ar, slug)
select id, x.name, x.name_ar, x.slug from public.categories c,
  (values
    ('Birthday Cakes','تورتات أعياد ميلاد','birthday-cakes'),
    ('Wedding Cakes','تورتات أفراح','wedding-cakes'),
    ('Mini Gateau','ميني جاتوه','mini-gateau'),
    ('Cupcakes','كب كيك','cupcakes')
  ) as x(name,name_ar,slug)
where c.slug = 'occasion-cakes'
on conflict do nothing;

-- حلويات شرقية
insert into public.subcategories (category_id, name, name_ar, slug)
select id, x.name, x.name_ar, x.slug from public.categories c,
  (values
    ('Baklava','بقلاوة','baklava'),
    ('Basbousa','بسبوسة','basbousa'),
    ('Kunafa','كنافة','kunafa'),
    ('Qatayef','قطايف','qatayef')
  ) as x(name,name_ar,slug)
where c.slug = 'oriental-sweets'
on conflict do nothing;

-- حلويات غربية
insert into public.subcategories (category_id, name, name_ar, slug)
select id, x.name, x.name_ar, x.slug from public.categories c,
  (values
    ('Croissant','كرواسون','croissant'),
    ('Donuts','دونات','donuts'),
    ('Cookies','كوكيز','cookies'),
    ('Macarons','ماكرون','macarons')
  ) as x(name,name_ar,slug)
where c.slug = 'western-pastries'
on conflict do nothing;

-- آيس كريم
insert into public.subcategories (category_id, name, name_ar, slug)
select id, x.name, x.name_ar, x.slug from public.categories c,
  (values
    ('Scoops','سكوب بالكوب/الكيلو','ice-cream-scoops'),
    ('Ice Cream Cakes','تورتة آيس كريم','ice-cream-cakes')
  ) as x(name,name_ar,slug)
where c.slug = 'ice-cream'
on conflict do nothing;

-- ساليزون
insert into public.subcategories (category_id, name, name_ar, slug)
select id, x.name, x.name_ar, x.slug from public.categories c,
  (values
    ('Mini Pizza','بيتزا صغيرة','mini-pizza'),
    ('Sambousek','سمبوسة','sambousek'),
    ('Savory Pies','فطائر مالحة','savory-pies'),
    ('Puff Pastry','عجينة الفيلو المحشية','puff-pastry')
  ) as x(name,name_ar,slug)
where c.slug = 'savory-bakery'
on conflict do nothing;

-- ============================================================================
-- ملاحظة تعيين أول أدمن:
-- 1) سجّلي حساب عادي من صفحة "إنشاء حساب" في الموقع (هيتسجل role = 'user' تلقائياً)
-- 2) بعد كده نفّذي في SQL Editor (غيّري الإيميل):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'admin@makka.com');
-- ============================================================================
