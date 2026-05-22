-- ================================================================
-- NomadTrails — Supabase (PostgreSQL) Schema + Seed Data
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- Drop existing tables (clean setup)
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS transport_options CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- TABLES
-- ================================================================

CREATE TABLE users (
  id         bigserial PRIMARY KEY,
  name       text,
  email      text UNIQUE NOT NULL,
  image      text,
  google_id  text UNIQUE,
  phone      text,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE locations (
  id         bigserial PRIMARY KEY,
  slug       text NOT NULL UNIQUE,
  category   text NOT NULL CHECK (category IN ('mountains', 'lakes', 'history', 'canyons')),
  image_url  text,
  name_en    text NOT NULL,
  name_ru    text,
  name_ky    text,
  region_en  text,
  region_ru  text,
  region_ky  text,
  desc_en    text,
  desc_ru    text,
  desc_ky    text,
  featured   boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tours (
  id             bigserial PRIMARY KEY,
  slug           text NOT NULL UNIQUE,
  duration_days  smallint NOT NULL,
  price_usd      numeric(10,2) NOT NULL,
  difficulty     text DEFAULT 'Moderate' CHECK (difficulty IN ('Easy', 'Moderate', 'Hard')),
  group_min      smallint DEFAULT 2,
  group_max      smallint DEFAULT 10,
  rating         numeric(3,2) DEFAULT 5.00,
  reviews_count  int DEFAULT 0,
  image_url      text,
  name_en        text NOT NULL,
  name_ru        text,
  name_ky        text,
  desc_en        text,
  desc_ru        text,
  desc_ky        text,
  includes_en    jsonb,
  includes_ru    jsonb,
  includes_ky    jsonb,
  active         boolean DEFAULT true,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE hotels (
  id              bigserial PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  type            text NOT NULL CHECK (type IN ('yurt', 'lodge', 'hotel', 'guesthouse')),
  price_per_night numeric(10,2) NOT NULL,
  rating          numeric(3,2) DEFAULT 5.00,
  reviews_count   int DEFAULT 0,
  image_url       text,
  name_en         text NOT NULL,
  name_ru         text,
  name_ky         text,
  location_en     text,
  location_ru     text,
  location_ky     text,
  amenities       jsonb,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE transport_options (
  id         bigserial PRIMARY KEY,
  type       text NOT NULL CHECK (type IN ('jeep', 'flight', 'visa', 'safety')),
  icon       text,
  title_en   text NOT NULL,
  title_ru   text,
  title_ky   text,
  desc_en    text,
  desc_ru    text,
  desc_ky    text,
  sort_order int DEFAULT 0
);

CREATE TABLE bookings (
  id               bigserial PRIMARY KEY,
  user_id          bigint REFERENCES users(id) ON DELETE SET NULL,
  item_type        text NOT NULL DEFAULT 'tour' CHECK (item_type IN ('tour', 'hotel', 'transport')),
  tour_id          bigint REFERENCES tours(id) ON DELETE SET NULL,
  hotel_id         bigint REFERENCES hotels(id) ON DELETE SET NULL,
  transport_id     bigint REFERENCES transport_options(id) ON DELETE SET NULL,
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text,
  preferred_date   date,
  guests           smallint DEFAULT 1,
  special_requests text,
  status           text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'cancelled')),
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE contact_messages (
  id         bigserial PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text,
  message    text NOT NULL,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- DISABLE ROW LEVEL SECURITY (using publishable/anon key)
-- ================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE transport_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- SEED DATA — LOCATIONS (6 destinations)
-- ================================================================

INSERT INTO locations (slug, category, image_url, name_en, name_ru, name_ky, region_en, region_ru, region_ky, desc_en, desc_ru, desc_ky, featured, sort_order) VALUES
(
  'kel-suu', 'lakes',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'Kel-Suu Lake', 'Озеро Кел-Суу', 'Кел-Суу Көлү',
  'Naryn Oblast', 'Нарынская область', 'Нарын облусу',
  'A hidden turquoise gem near the Chinese border, accessible only by horse.',
  'Скрытая бирюзовая жемчужина у китайской границы, доступная только верхом.',
  'Кытай чек арасынын жанындагы жашырын феруза асыл таш, аттап гана жетилет.',
  true, 1
),
(
  'skazka-canyon', 'canyons',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'Skazka Canyon', 'Каньон Сказка', 'Сказка Каньону',
  'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу',
  'Fairy-tale red sandstone formations rising from the Kyrgyz steppe.',
  'Сказочные формации из красного песчаника, возвышающиеся над Киргизской степью.',
  'Кыргыз талаасынан бийик турган эртектеги кызыл кумташ формациялары.',
  true, 2
),
(
  'tash-rabat', 'history',
  'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&q=80',
  'Tash-Rabat', 'Таш-Рабат', 'Таш-Рабат',
  'Naryn Oblast', 'Нарынская область', 'Нарын облусу',
  'A 15th-century stone caravanserai on the ancient Silk Road route.',
  'Каменный каравансарай XV века на древнем Шёлковом пути.',
  'Байыркы Жибек жолундагы XV кылымдагы таш керме-сарай.',
  true, 3
),
(
  'enilchek', 'mountains',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  'Enilchek Glacier', 'Ледник Энилчек', 'Энилчек Мөңгүсү',
  'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу',
  'One of the largest non-polar glaciers in the world, deep in the Tian Shan.',
  'Один из крупнейших непolar ледников мира, в глубине Тянь-Шаня.',
  'Тянь-Шааньдын жүрөгүндөгү дүйнөдөгү эң чоң полярдык эмес мөңгүлөрдүн бири.',
  true, 4
),
(
  'son-kul', 'lakes',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  'Son-Kul Lake', 'Озеро Сон-Куль', 'Сон-Күл Көлү',
  'Naryn Oblast', 'Нарынская область', 'Нарын облусу',
  'A high-altitude nomadic pasture lake at 3,016 m with traditional yurt camps.',
  'Высокогорное кочевое пастбищное озеро на высоте 3016 м с юрточными лагерями.',
  '3016 м бийиктиктеги жогорку тоолуу кочмон жайыт көлү, юрт лагерлери менен.',
  false, 5
),
(
  'sary-jaz', 'mountains',
  'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80',
  'Sary-Jaz Valley', 'Долина Сары-Жаз', 'Сары-Жаз Өрөөнү',
  'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу',
  'Remote alpine valleys with sheer 7,000 m walls and pristine wilderness.',
  'Отдалённые альпийские долины с отвесными стенами в 7000 м и нетронутой природой.',
  'Бардык жагынан 7000 м тик дубалдары бар алыскы альп өрөөндөрү.',
  false, 6
);

-- ================================================================
-- SEED DATA — TOURS (4 tours matching frontend)
-- ================================================================

INSERT INTO tours (slug, duration_days, price_usd, difficulty, group_min, group_max, rating, reviews_count, image_url, name_en, name_ru, name_ky, desc_en, desc_ru, desc_ky, includes_en, includes_ru, includes_ky) VALUES
(
  'kel-suu-explorer', 7, 890.00, 'Moderate', 2, 8, 4.9, 47,
  'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80',
  'Kel-Suu & Tash-Rabat Explorer',
  'Тур Кел-Суу и Таш-Рабат',
  'Кел-Суу жана Таш-Рабат саякаты',
  'Discover the hidden turquoise lake Kel-Suu and the ancient Silk Road caravanserai of Tash-Rabat on this 7-day moderate trek through the Naryn highlands.',
  'Откройте для себя скрытое бирюзовое озеро Кел-Суу и древний каравансарай Таш-Рабат на этом 7-дневном треке по Нарынскому нагорью.',
  'Нарын тоо өрөөнүндөгү 7 күндүк трек аркылуу жашырын феруза Кел-Суу көлүн жана байыркы Таш-Рабат керме-сарайын ачыңыз.',
  '["Guide", "Transport", "Yurt Stays", "Meals", "Permits"]',
  '["Гид", "Транспорт", "Юрты", "Питание", "Разрешения"]',
  '["Гид", "Транспорт", "Боз үй", "Тамак-аш", "Уруксаттар"]'
),
(
  'enilchek-expedition', 12, 2400.00, 'Hard', 2, 6, 5.0, 18,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'Enilchek Glacier Expedition',
  'Экспедиция на ледник Энилчек',
  'Энилчек мөңгүсүнө экспедиция',
  'An epic 12-day expedition to one of the world''s largest non-polar glaciers. Helicopter access, advanced camping, and awe-inspiring views of Khan Tengri peak.',
  'Эпическая 12-дневная экспедиция к одному из крупнейших непolar ледников мира. Вертолётный заброс, продвинутый кемпинг и захватывающие виды на пик Хан Тенгри.',
  'Дүйнөдөгү эң чоң полярдык эмес мөңгүлөрдүн бирине 12 күндүк эпикалык экспедиция. Вертолёт менен кирүү жана Хан Теңир чокусуна таасирдүү көрүнүштөр.',
  '["Helicopter", "Guide", "Camp Equipment", "Meals", "Insurance"]',
  '["Вертолёт", "Гид", "Снаряжение", "Питание", "Страховка"]',
  '["Вертолёт", "Гид", "Жабдуулар", "Тамак-аш", "Камсыздандыруу"]'
),
(
  'issyk-kul-discovery', 5, 550.00, 'Easy', 2, 12, 4.8, 92,
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'Issyk-Kul Discovery Loop',
  'Путешествие вокруг Иссык-Куля',
  'Ысык-Көл айлануу саякаты',
  'Circle the world''s second-largest alpine lake in 5 relaxed days. Visit ancient petroglyphs, Skazka Canyon, hot springs, and charming lakeside villages.',
  'Объедьте второе по величине горное озеро мира за 5 расслабленных дней. Посетите древние петроглифы, каньон Сказка, горячие источники и деревушки.',
  'Дүйнөдөгү экинчи эң чоң тоо көлүн 5 эс алдырган күндө айланып чыгыңыз. Байыркы петроглифтерди, Сказка каньонун жана ысык булактарды зыярат кылыңыз.',
  '["Guide", "Transport", "Hotel", "Breakfast"]',
  '["Гид", "Транспорт", "Отель", "Завтрак"]',
  '["Гид", "Транспорт", "Мейманкана", "Эртеңки тамак"]'
),
(
  'nomadic-life', 9, 1250.00, 'Moderate', 2, 8, 4.9, 33,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'Nomadic Life & Eagle Hunting',
  'Кочевая жизнь и охота с беркутом',
  'Көчмөн жашоо жана бүркүт мергенчилик',
  'Immerse yourself in authentic nomadic culture for 9 days. Live with Kyrgyz herder families, witness eagle hunting, and ride horses across alpine pastures.',
  'Погрузитесь в подлинную кочевую культуру на 9 дней. Живите с кыргызскими скотоводами, наблюдайте охоту с беркутом, скачите на лошадях по пастбищам.',
  '9 күн бою чыныгы көчмөн маданиятына чомулуп кетиңиз. Кыргыз малчы үй-бүлөлөрү менен жашаңыз, бүркүт мергенчилигине күбө болуңуз.',
  '["Guide", "Yurt Stays", "Eagle Show", "Meals", "Horse Riding"]',
  '["Гид", "Юрты", "Беркутчи", "Питание", "Верховая езда"]',
  '["Гид", "Боз үй", "Бүркүтчү", "Тамак-аш", "Ат жарыш"]'
);

-- ================================================================
-- SEED DATA — HOTELS (6 hotels matching frontend)
-- ================================================================

INSERT INTO hotels (slug, type, price_per_night, rating, reviews_count, image_url, name_en, name_ru, name_ky, location_en, location_ru, location_ky, amenities) VALUES
(
  'yurt-camp-kel-suu', 'yurt', 85.00, 4.9, 64,
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
  'Yurt Camp Kel-Suu', 'Юрточный лагерь Кел-Суу', 'Кел-Суу боз үй лагери',
  'Naryn Oblast', 'Нарынская область', 'Нарын облусу',
  '["meals", "transfer", "horse_riding"]'
),
(
  'khan-tengri-lodge', 'lodge', 145.00, 4.8, 41,
  'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80',
  'Khan Tengri Lodge', 'Хан Тенгри Лодж', 'Хан Теңир Лодж',
  'Karakol', 'Каракол', 'Каракол',
  '["wifi", "spa", "transfer", "meals"]'
),
(
  'issyk-kul-boutique', 'hotel', 220.00, 5.0, 28,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'Issyk-Kul Boutique', 'Иссык-Куль Бутик', 'Ысык-Көл Бутик',
  'Cholpon-Ata', 'Чолпон-Ата', 'Чолпон-Ата',
  '["wifi", "pool", "meals", "transfer", "spa"]'
),
(
  'tash-rabat-guesthouse', 'guesthouse', 55.00, 4.7, 83,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'Tash-Rabat Guesthouse', 'Гостевой дом Таш-Рабат', 'Таш-Рабат конок үй',
  'Naryn', 'Нарын', 'Нарын',
  '["meals", "transfer"]'
),
(
  'son-kul-sky-camp', 'yurt', 95.00, 4.9, 52,
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80',
  'Son-Kul Sky Camp', 'Скай Кэмп Сон-Куль', 'Сон-Күл Асман Лагери',
  'Naryn Oblast', 'Нарынская область', 'Нарын облусу',
  '["meals", "horse_riding", "transfer"]'
),
(
  'bishkek-luxe-hotel', 'hotel', 180.00, 4.8, 107,
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  'Bishkek Luxe Hotel', 'Бишкек Люкс Отель', 'Бишкек Люкс Мейманкана',
  'Bishkek', 'Бишкек', 'Бишкек',
  '["wifi", "pool", "spa", "meals", "transfer"]'
);

-- ================================================================
-- SEED DATA — TRANSPORT OPTIONS (4 types)
-- ================================================================

INSERT INTO transport_options (type, icon, title_en, title_ru, title_ky, desc_en, desc_ru, desc_ky, sort_order) VALUES
(
  'jeep', 'Car',
  '4×4 Jeep Rentals', 'Аренда внедорожников 4×4', '4×4 Жип ижарасы',
  'Rugged off-road vehicles with experienced local drivers for remote expeditions.',
  'Мощные внедорожники с опытными местными водителями для труднодоступных экспедиций.',
  'Алыскы экспедициялар үчүн тажрыйбалуу жергиликтүү айдоочулар менен күчтүү жол тандабас унаалар.',
  1
),
(
  'flight', 'Plane',
  'Domestic Flights', 'Внутренние рейсы', 'Ички рейстер',
  'Regular flights connecting Bishkek to Osh and key regional cities.',
  'Регулярные рейсы, соединяющие Бишкек с Ошом и ключевыми региональными городами.',
  'Бишкекти Ош жана негизги аймактык шаарлар менен байланыштырган туруктуу рейстер.',
  2
),
(
  'visa', 'FileText',
  'Visa Information', 'Визовая информация', 'Виза маалыматы',
  'Kyrgyzstan offers e-visa and visa-free entry for 60+ nationalities.',
  'Кыргызстан предлагает электронную визу и безвизовый въезд для 60+ национальностей.',
  'Кыргызстан 60тан ашык улуттук үчүн электрондук виза жана визасыз кирүүнү сунуштайт.',
  3
),
(
  'safety', 'Shield',
  'Safety & Tips', 'Безопасность и советы', 'Коопсуздук жана кеңештер',
  'Altitude acclimatisation, travel insurance, and emergency contacts covered.',
  'Высотная акклиматизация, туристическая страховка и экстренные контакты.',
  'Бийиктикке адаптация, саякат камсыздандыруу жана өзгөчө кырдаал байланыштары.',
  4
);

-- ================================================================
-- SEED DATA — SAMPLE BOOKINGS (8 realistic bookings)
-- ================================================================

INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status) VALUES
('tour',      1, NULL, NULL, 'Alex Johnson',     'alex.johnson@email.com',     '+1 555 0101',          '2025-07-15', 2, 'Vegetarian meals please',                            'confirmed'),
('tour',      2, NULL, NULL, 'Marie Dubois',      'marie.dubois@email.com',     '+33 6 12 34 56 78',    '2025-08-01', 4, 'Need porter service for heavy equipment',            'contacted'),
('hotel', NULL, 3, NULL,     'Chen Wei',          'chen.wei@email.com',         '+86 138 0000 1234',    '2025-07-20', 2, 'Anniversary trip — room upgrade if possible',        'confirmed'),
('tour',      3, NULL, NULL, 'Sven Eriksson',     'sven@eriksson.se',           '+46 70 123 4567',      '2025-06-10', 6, 'Group of friends, some first-time hikers',           'new'),
('tour',      4, NULL, NULL, 'Fatima Al-Hassan',  'fatima@example.com',         '+971 50 123 4567',     '2025-09-05', 3, 'Halal food required for the whole group',            'new'),
('hotel', NULL, 1, NULL,     'James Wilson',      'j.wilson@travel.com',        '+44 20 1234 5678',     '2025-07-28', 2, 'Early check-in from 10am if possible',               'confirmed'),
('transport', NULL, NULL, 1, 'Pedro Costa',       'pedro@costa.com.br',         '+55 11 91234 5678',    '2025-08-15', 1, 'Need English-speaking driver',                       'contacted'),
('tour',      1, NULL, NULL, 'Yuki Tanaka',       'yuki.tanaka@jp.com',         '+81 90 1234 5678',     '2025-10-01', 2, 'Photography enthusiast — slow pace preferred',       'new');

-- ================================================================
-- SEED DATA — CONTACT MESSAGES (3 messages)
-- ================================================================

INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES
(
  'Sarah Connor', 'sarah@future.net',
  'Custom Tour Request',
  'Hello! I''d like to plan a custom 14-day trip combining the Enilchek glacier and the nomadic culture tour. Is this possible for a group of 5?',
  true
),
(
  'Thomas Mueller', 'thomas.m@gmail.de',
  'Group Booking — 15 people',
  'We are a corporate team looking for a team-building adventure in August 2025. Can you accommodate 15 people and offer a group discount?',
  false
),
(
  'Anita Sharma', 'anita.sharma@india.in',
  'Honeymoon Package',
  'My fiancé and I are looking for a romantic honeymoon experience in Kyrgyzstan. What do you recommend for a couple visiting in September?',
  false
);

-- ================================================================
-- MAKE AN ADMIN USER (run after first Google login)
-- Replace the email with your own Google account email:
-- UPDATE users SET role = 'admin' WHERE email = 'youremail@gmail.com';
-- ================================================================
