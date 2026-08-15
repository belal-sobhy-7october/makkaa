-- ============================================================================
-- مكة للحلواني — Supabase Database Schema
-- بديل كامل للباك اند القديم (Node/Express/Mongo) الخاص بـ Laresa
-- شغّليه في: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- بريد إلكتروني/أسماء غير حساسة لحالة الأحرف

-- ============================================================================
-- 1) PROFILES  (بديل userModel — بيمتد جدول auth.users بتاع Supabase)
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  slug          text,
  phone         text,
  profile_img   text,
  role          text not null default 'user' check (role in ('user','manager','admin')),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'بيانات المستخدم الإضافية (الاسم، الدور، الهاتف...) مرتبطة بـ auth.users';

-- تريجر: إنشاء صف profile تلقائياً عند تسجيل مستخدم جديد في auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- دالة مساعدة: هل المستخدم الحالي أدمن/مدير؟ (تُستخدم في الـ RLS)
create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','manager')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- 2) CATEGORIES  (التصنيفات: كيك، حلويات شرقية، ساليزون...)
-- ============================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  name_ar     text,
  slug        text not null,
  image       text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_categories_slug on public.categories(slug);

-- ============================================================================
-- 3) SUBCATEGORIES
-- ============================================================================
create table if not exists public.subcategories (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name        text not null,
  name_ar     text,
  slug        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (category_id, name)
);

create index if not exists idx_subcategories_category on public.subcategories(category_id);

-- ============================================================================
-- 4) PRODUCTS  (منتجات: تورتة فروتي، بسبوسة بالقشطة، دونات نوتيلا...)
-- ============================================================================
create table if not exists public.products (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null check (char_length(title) between 3 and 120),
  title_ar              text,
  slug                  text not null,
  description           text not null check (char_length(description) >= 20),
  category_id           uuid not null references public.categories(id),
  subcategory_id        uuid references public.subcategories(id),

  -- تسعير وكمية
  price                 numeric(10,2) not null check (price >= 0),
  price_after_discount  numeric(10,2) check (price_after_discount is null or price_after_discount < price),
  quantity              int not null default 0 check (quantity >= 0),
  sold                  int not null default 0,

  -- خصائص خاصة بمنتجات الحلويات (اختيارية)
  unit                  text default 'قطعة',        -- قطعة / كيلو / صينية / علبة
  sizes                 jsonb,                        -- مثال: [{"label":"صغير 1كجم","price":150}, ...] لتورتات المناسبات
  is_available_daily    boolean not null default true, -- تصنيع يومي / حسب الطلب فقط
  requires_preorder     boolean not null default false, -- منتجات مناسبات تحتاج حجز مسبق

  -- صور (روابط كاملة من Supabase Storage)
  image_cover           text,
  images                text[] not null default '{}',

  -- تقييمات (تتحدث تلقائياً من reviews عبر تريجر)
  ratings_average       numeric(2,1) default 0 check (ratings_average between 0 and 5),
  ratings_quantity      int not null default 0,

  is_featured           boolean not null default false,
  is_active             boolean not null default true,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_subcategory on public.products(subcategory_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_active on public.products(is_active);
-- بحث نصي بسيط بالعربي/الإنجليزي
create index if not exists idx_products_search on public.products
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(title_ar,'') || ' ' || coalesce(description,'')));

-- ============================================================================
-- 5) REVIEWS
-- ============================================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,
  rating      numeric(2,1) not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, user_id) -- مستخدم واحد = تقييم واحد لكل منتج
);

create index if not exists idx_reviews_product on public.reviews(product_id);

-- تريجر: إعادة حساب متوسط التقييم بعد أي تغيير
create or replace function public.recalc_product_ratings()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set ratings_average = coalesce((select round(avg(r.rating)::numeric,1) from public.reviews r where r.product_id = pid), 0),
      ratings_quantity = (select count(*) from public.reviews r where r.product_id = pid)
  where p.id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_recalc on public.reviews;
create trigger trg_reviews_recalc
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalc_product_ratings();

-- ============================================================================
-- 6) WISHLIST
-- ============================================================================
create table if not exists public.wishlist (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============================================================================
-- 7) ADDRESSES
-- ============================================================================
create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  alias        text,
  details      text not null,
  phone        text not null,
  city         text,
  postal_code  text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ============================================================================
-- 8) COUPONS
-- ============================================================================
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  name        citext not null unique,
  discount    numeric(5,2) not null check (discount between 0 and 100),
  expire_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 9) CARTS + CART ITEMS
-- ============================================================================
create table if not exists public.carts (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references public.profiles(id) on delete cascade,
  coupon_id                 uuid references public.coupons(id),
  total_cart_price          numeric(10,2) not null default 0,
  total_price_after_discount numeric(10,2),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  product_id  uuid not null references public.products(id),
  quantity    int not null default 1 check (quantity > 0),
  variant     text,   -- مثال: حجم التورتة "1 كجم" بدل اللون في المشروع الأصلي
  price       numeric(10,2) not null, -- سعر وقت الإضافة (snapshot)
  created_at  timestamptz not null default now(),
  unique (cart_id, product_id, variant)
);

create index if not exists idx_cart_items_cart on public.cart_items(cart_id);

-- تريجر: إعادة حساب إجمالي السلة بعد أي تعديل على الأصناف
create or replace function public.recalc_cart_total()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  cid uuid := coalesce(new.cart_id, old.cart_id);
  v_total numeric(10,2);
begin
  select coalesce(sum(quantity * price), 0) into v_total
  from public.cart_items where cart_id = cid;

  update public.carts
  set total_cart_price = v_total,
      total_price_after_discount = null, -- يتصفّر الخصم لازم يتطبق تاني بعد أي تعديل
      updated_at = now()
  where id = cid;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_cart_items_recalc on public.cart_items;
create trigger trg_cart_items_recalc
  after insert or update or delete on public.cart_items
  for each row execute procedure public.recalc_cart_total();

-- ============================================================================
-- 10) ORDERS + ORDER ITEMS
-- ============================================================================
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id),
  shipping_details      text not null,
  shipping_phone        text not null,
  shipping_city         text,
  shipping_postal_code  text,
  tax_price             numeric(10,2) not null default 0,
  shipping_price        numeric(10,2) not null default 0,
  total_order_price     numeric(10,2) not null,
  payment_method_type   text not null default 'cash' check (payment_method_type in ('cash','card')),
  is_paid               boolean not null default false,
  paid_at               timestamptz,
  is_delivered          boolean not null default false,
  delivered_at          timestamptz,
  status                text not null default 'pending'
                        check (status in ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     uuid references public.products(id),
  title_snapshot text not null,
  image_snapshot text,
  quantity       int not null check (quantity > 0),
  variant        text,
  price          numeric(10,2) not null
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ============================================================================
-- 11) RPC: تطبيق كوبون خصم على السلة
-- ============================================================================
create or replace function public.apply_coupon_to_cart(p_coupon_name text)
returns public.carts
language plpgsql
security definer set search_path = public
as $$
declare
  v_cart public.carts;
  v_coupon public.coupons;
begin
  select * into v_cart from public.carts where user_id = auth.uid();
  if v_cart is null then
    raise exception 'لا توجد سلة لهذا المستخدم';
  end if;

  select * into v_coupon from public.coupons
  where name = p_coupon_name and expire_at > now();

  if v_coupon is null then
    raise exception 'كوبون غير صالح أو منتهي';
  end if;

  update public.carts
  set coupon_id = v_coupon.id,
      total_price_after_discount = round(total_cart_price - (total_cart_price * v_coupon.discount / 100), 2),
      updated_at = now()
  where id = v_cart.id
  returning * into v_cart;

  return v_cart;
end;
$$;

-- ============================================================================
-- 12) RPC: إنشاء طلب من السلة (كاش) — تنفّذ بصلاحيات أعلى من صلاحيات المستخدم العادي
-- ============================================================================
create or replace function public.create_order_from_cart(
  p_details text,
  p_phone text,
  p_city text default null,
  p_postal_code text default null
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  v_cart public.carts;
  v_total numeric(10,2);
  v_order public.orders;
  v_item record;
begin
  select * into v_cart from public.carts where user_id = auth.uid();
  if v_cart is null or not exists (select 1 from public.cart_items where cart_id = v_cart.id) then
    raise exception 'السلة فارغة';
  end if;

  v_total := coalesce(v_cart.total_price_after_discount, v_cart.total_cart_price);

  insert into public.orders (user_id, shipping_details, shipping_phone, shipping_city, shipping_postal_code, total_order_price)
  values (auth.uid(), p_details, p_phone, p_city, p_postal_code, v_total)
  returning * into v_order;

  for v_item in select ci.*, p.title as p_title, p.title_ar as p_title_ar, p.image_cover as p_image
                from public.cart_items ci join public.products p on p.id = ci.product_id
                where ci.cart_id = v_cart.id
  loop
    insert into public.order_items (order_id, product_id, title_snapshot, image_snapshot, quantity, variant, price)
    values (v_order.id, v_item.product_id, coalesce(v_item.p_title_ar, v_item.p_title), v_item.p_image, v_item.quantity, v_item.variant, v_item.price);

    update public.products
    set quantity = greatest(quantity - v_item.quantity, 0),
        sold = sold + v_item.quantity
    where id = v_item.product_id;
  end loop;

  delete from public.cart_items where cart_id = v_cart.id;
  update public.carts set coupon_id = null, total_cart_price = 0, total_price_after_discount = null where id = v_cart.id;

  return v_order;
end;
$$;

-- ============================================================================
-- 13) RPC: تحديث حالة الدفع/التوصيل (أدمن/مدير فقط)
-- ============================================================================
create or replace function public.mark_order_paid(p_order_id uuid)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'غير مصرح لك بهذا الإجراء';
  end if;
  update public.orders set is_paid = true, paid_at = now(), updated_at = now()
  where id = p_order_id returning * into v_order;
  return v_order;
end;
$$;

create or replace function public.mark_order_delivered(p_order_id uuid)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'غير مصرح لك بهذا الإجراء';
  end if;
  update public.orders set is_delivered = true, delivered_at = now(), status = 'delivered', updated_at = now()
  where id = p_order_id returning * into v_order;
  return v_order;
end;
$$;

-- ============================================================================
-- 14) Row Level Security (RLS)
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.subcategories  enable row level security;
alter table public.products       enable row level security;
alter table public.reviews        enable row level security;
alter table public.wishlist       enable row level security;
alter table public.addresses      enable row level security;
alter table public.coupons        enable row level security;
alter table public.carts          enable row level security;
alter table public.cart_items     enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ---- profiles ----
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_manage" on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---- categories / subcategories (قراءة عامة، كتابة أدمن/مدير) ----
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories
  for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories
  for update using (public.is_admin()) with check (public.is_admin());
create policy "categories_admin_delete" on public.categories
  for delete using (public.is_super_admin());

create policy "subcategories_public_read" on public.subcategories for select using (true);
create policy "subcategories_admin_write" on public.subcategories
  for insert with check (public.is_admin());
create policy "subcategories_admin_update" on public.subcategories
  for update using (public.is_admin()) with check (public.is_admin());
create policy "subcategories_admin_delete" on public.subcategories
  for delete using (public.is_super_admin());

-- ---- products (قراءة عامة للمتاح فقط، كتابة أدمن/مدير) ----
create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_super_admin());

-- ---- reviews ----
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_owner_write" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_owner_update" on public.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews_owner_or_admin_delete" on public.reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---- wishlist (المستخدم يشوف ويعدل بتاعه بس) ----
create policy "wishlist_owner_all" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- addresses ----
create policy "addresses_owner_all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- coupons (المستخدم العادي مايشوفهاش، بس الـ RPC بيتحقق منها بصلاحية أعلى) ----
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- carts / cart_items ----
create policy "carts_owner_all" on public.carts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cart_items_owner_all" on public.cart_items
  for all using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- ---- orders / order_items (المستخدم يشوف طلباته بس، الأدمن يشوف الكل) ----
create policy "orders_owner_or_admin_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
-- ملاحظة: إنشاء الطلبات يتم فقط عبر دالة create_order_from_cart (security definer)
-- عشان كده مفيش policy لـ insert هنا للمستخدم العادي مباشرة على الجدول.

create policy "order_items_owner_or_admin_select" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ============================================================================
-- 15) Storage buckets (صور المنتجات والتصنيفات)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('categories', 'categories', true)
on conflict (id) do nothing;

-- قراءة عامة للصور
create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'products');
create policy "public_read_category_images" on storage.objects
  for select using (bucket_id = 'categories');

-- رفع/تعديل/حذف الصور: أدمن/مدير فقط
create policy "admin_write_product_images" on storage.objects
  for insert with check (bucket_id = 'products' and public.is_admin());
create policy "admin_update_product_images" on storage.objects
  for update using (bucket_id = 'products' and public.is_admin());
create policy "admin_delete_product_images" on storage.objects
  for delete using (bucket_id = 'products' and public.is_admin());

create policy "admin_write_category_images" on storage.objects
  for insert with check (bucket_id = 'categories' and public.is_admin());
create policy "admin_update_category_images" on storage.objects
  for update using (bucket_id = 'categories' and public.is_admin());
create policy "admin_delete_category_images" on storage.objects
  for delete using (bucket_id = 'categories' and public.is_admin());

-- ============================================================================
-- انتهت السكيما
-- ============================================================================
