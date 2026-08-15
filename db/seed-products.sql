-- 1. إدخال التصنيفات الأساسية بدون تكرار
insert into categories (name, name_ar, slug)
select * from (values 
  ('Occasion Cakes', 'تورتات المناسبات', 'occasion-cakes'),
  ('Oriental Sweets', 'حلويات شرقية', 'oriental-sweets'),
  ('Western Pastries', 'حلويات غربية', 'western-pastries'),
  ('Ice Cream', 'آيس كريم', 'ice-cream'),
  ('Savory Bakery', 'مخبوزات مالحة', 'savory-bakery')
) as v(name, name_ar, slug)
where not exists (
  select 1 from categories c where c.slug = v.slug
);

-- 2. إدخال المنتجات وربطها بالتصنيفات مباشرة
do $$
declare
  v_tortat_id uuid;
  v_sharqia_id uuid;
  v_gharbia_id uuid;
  v_icecream_id uuid;
  v_makhbuzat_id uuid;
begin
  select id into v_tortat_id from categories where slug = 'occasion-cakes';
  select id into v_sharqia_id from categories where slug = 'oriental-sweets';
  select id into v_gharbia_id from categories where slug = 'western-pastries';
  select id into v_icecream_id from categories where slug = 'ice-cream';
  select id into v_makhbuzat_id from categories where slug = 'savory-bakery';

  -- Occasion Cakes
  insert into products (title, title_ar, slug, description, price, quantity, category_id, requires_preorder, is_active, created_at) values
  ('Chocolate Gateau', 'جاتوه شوكولاتة', 'chocolate-gateau', 'Rich chocolate gateau with layers of dark chocolate ganache and vanilla buttercream. Perfect for birthdays and celebrations.', 450, 10, v_tortat_id, true, true, now()),
  ('Vanilla Birthday Cake', 'تورتة عيد ميلاد فانيليا', 'vanilla-birthday-cake', 'Classic vanilla sponge with strawberry filling and whipped cream frosting. Customizable message on top.', 380, 10, v_tortat_id, true, true, now()),
  ('Red Velvet Cake', 'تورتة ريد فيلفت', 'red-velvet-cake', 'Moist red velvet cake layered with cream cheese frosting. A timeless favorite for special occasions.', 420, 8, v_tortat_id, true, true, now()),
  ('Mini Cupcake Box (12 pcs)', 'علبة كب كيك صغير (12 حبة)', 'mini-cupcake-box', 'Assorted mini cupcakes — chocolate, vanilla, red velvet, and lemon. Perfect for parties and gifts.', 180, 20, v_tortat_id, false, true, now()),
  ('Wedding Cake - 3 Tier', 'تورتة فرح 3 أدوار', 'wedding-cake-3-tier', 'Elegant three-tier wedding cake with white fondant, edible flowers, and gold accents. Serves 60–80 guests.', 2500, 3, v_tortat_id, true, true, now());

  -- Oriental Sweets
  insert into products (title, title_ar, slug, description, price, quantity, category_id, requires_preorder, is_active, created_at) values
  ('Mixed Baklava Tray (1 kg)', 'صينية بقلاوة مشكلة (1 كجم)', 'mixed-baklava-tray', 'Assorted baklava with walnuts, pistachios, and cashews — layered with crispy filo and sweet syrup.', 320, 15, v_sharqia_id, false, true, now()),
  ('Basbousa with Cream (500 g)', 'بسبوسة بالقشطة (500 جم)', 'basbousa-with-cream', 'Soft semolina cake topped with cream and drizzled with syrup. A beloved Egyptian classic.', 150, 20, v_sharqia_id, false, true, now()),
  ('Konafa with Cheese (1 kg)', 'كنافة بالجبنة (1 كجم)', 'konafa-with-cheese', 'Golden shredded phyllo pastry filled with melted mozzarella, soaked in sweet syrup. Served hot.', 280, 12, v_sharqia_id, false, true, now()),
  ('Qatayef (20 pcs)', 'قطايف (20 حبة)', 'qatayef', 'Stuffed semolina pancakes with walnuts, cinnamon, and coconut. Fried and soaked in syrup.', 200, 10, v_sharqia_id, false, true, now()),
  ('Lemon Basbousa (500 g)', 'بسبوسة ليمون (500 جم)', 'lemon-basbousa', 'Refreshing lemon-flavored basbousa with a citrus twist. Light and perfect with tea.', 160, 15, v_sharqia_id, false, true, now());

  -- Western Pastries
  insert into products (title, title_ar, slug, description, price, quantity, category_id, requires_preorder, is_active, created_at) values
  ('Butter Croissant', 'كرواسون زبدة', 'butter-croissant', 'Flaky, buttery croissant baked fresh daily. Layers of golden perfection.', 25, 30, v_gharbia_id, false, true, now()),
  ('Assorted Donuts (6 pcs)', 'دونات مشكلة (6 حبات)', 'assorted-donuts', 'Mix of glazed, chocolate, and sprinkles donuts. Soft and freshly made.', 120, 15, v_gharbia_id, false, true, now()),
  ('Chocolate Chip Cookies (12 pcs)', 'كوكيز برقائق الشوكولاتة (12 حبة)', 'chocolate-chip-cookies', 'Chewy cookies loaded with dark chocolate chips. Baked to golden perfection.', 90, 25, v_gharbia_id, false, true, now()),
  ('French Macarons (12 pcs)', 'ماكارون فرنسي (12 حبة)', 'french-macarons', 'Delicate almond macarons in assorted flavors — raspberry, pistachio, chocolate, and vanilla.', 250, 10, v_gharbia_id, false, true, now()),
  ('Cinnamon Rolls (4 pcs)', 'لفائف القرفة (4 حبات)', 'cinnamon-rolls', 'Soft cinnamon rolls with cream cheese icing. Baked fresh and irresistibly aromatic.', 100, 18, v_gharbia_id, false, true, now());

  -- Ice Cream
  insert into products (title, title_ar, slug, description, price, quantity, category_id, requires_preorder, is_active, created_at) values
  ('Ice Cream Scoop', 'سكوب آيس كريم', 'ice-cream-scoop', 'Creamy ice cream in vanilla, chocolate, strawberry, or mango. Made with fresh milk and cream.', 35, 100, v_icecream_id, false, true, now()),
  ('Ice Cream Cake (1 kg)', 'تورتة آيس كريم (1 كجم)', 'ice-cream-cake', 'Layers of ice cream and sponge cake with chocolate and caramel drizzle. Customizable flavors.', 350, 8, v_icecream_id, true, true, now()),
  ('Fruit Sorbet Scoop', 'سوربيه فواكه', 'fruit-scoop', 'Refreshing dairy-free sorbet in lemon, mango, or mixed berry. Made with real fruit puree.', 30, 60, v_icecream_id, false, true, now());

  -- Savory Bakery
  insert into products (title, title_ar, slug, description, price, quantity, category_id, requires_preorder, is_active, created_at) values
  ('Mini Pizza (10 pcs)', 'بيتزا صغيرة (10 حبات)', 'mini-pizza', 'Individual mini pizzas with cheese, olives, and mixed toppings. Perfect for parties.', 150, 20, v_makhbuzat_id, false, true, now()),
  ('Cheese Sambousek (15 pcs)', 'سمبوسك جبنة (15 حبة)', 'cheese-sambousek', 'Crispy fried sambousek filled with melted cheese and herbs. A savory favorite.', 100, 25, v_makhbuzat_id, false, true, now()),
  ('Meat Pies (10 pcs)', 'فطائر لحم (10 حبات)', 'meat-pies', 'Flaky pies stuffed with seasoned minced beef, onions, and pine nuts.', 160, 15, v_makhbuzat_id, false, true, now()),
  ('Puff Pastry Rolls (12 pcs)', 'لفائف عجينة البف (12 حبة)', 'puff-pastry-rolls', 'Golden puff pastry rolls filled with cheese and zaatar or spinach. Great as appetizers.', 120, 20, v_makhbuzat_id, false, true, now());

  raise notice 'Categories & Sample products seeded successfully';
end $$;