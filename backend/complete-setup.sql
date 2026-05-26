-- =====================================================================
-- NOMADTRAILS — ПОЛНАЯ УСТАНОВКА БД (один SQL файл)
--
-- ВЫПОЛНИТЬ ОДИН РАЗ:
-- https://supabase.com/dashboard/project/teiszkztlzcrxmudcbiz/sql/new
--
-- Создаёт:
--   ✅ Все таблицы (users, locations, tours, hotels, transport_options,
--                   bookings, contact_messages)
--   ✅ Отключает RLS, даёт права anon/authenticated
--   ✅ Включает pgcrypto для bcrypt
--   ✅ Заполняет демо-данными (6 локаций, 4 тура, 6 отелей, 4 транспорта,
--      8 бронирований, 6 сообщений)
--   ✅ Создаёт админа: admin@gmail.com / 2026baitur
--
-- БЕЗОПАСНО ЗАПУСКАТЬ ПОВТОРНО — таблицы пересоздаются с нуля.
-- =====================================================================

-- ============= 1. CLEAN SLATE =============
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS bookings         CASCADE;
DROP TABLE IF EXISTS transport_options CASCADE;
DROP TABLE IF EXISTS hotels           CASCADE;
DROP TABLE IF EXISTS tours            CASCADE;
DROP TABLE IF EXISTS locations        CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- ============= 2. EXTENSIONS =============
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============= 3. TABLES =============

CREATE TABLE users (
  id            bigserial PRIMARY KEY,
  name          text,
  email         text UNIQUE NOT NULL,
  image         text,
  google_id     text UNIQUE,
  phone         text,
  password_hash text,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE locations (
  id         bigserial PRIMARY KEY,
  slug       text NOT NULL UNIQUE,
  category   text NOT NULL CHECK (category IN ('mountains','lakes','history','canyons')),
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
  id            bigserial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  duration_days smallint NOT NULL,
  price_usd     numeric(10,2) NOT NULL,
  difficulty    text DEFAULT 'Moderate' CHECK (difficulty IN ('Easy','Moderate','Hard')),
  group_min     smallint DEFAULT 2,
  group_max     smallint DEFAULT 10,
  rating        numeric(3,2) DEFAULT 5.00,
  reviews_count int DEFAULT 0,
  image_url     text,
  name_en       text NOT NULL,
  name_ru       text,
  name_ky       text,
  desc_en       text,
  desc_ru       text,
  desc_ky       text,
  includes_en   jsonb,
  includes_ru   jsonb,
  includes_ky   jsonb,
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE hotels (
  id              bigserial PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  type            text NOT NULL CHECK (type IN ('yurt','lodge','hotel','guesthouse')),
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
  type       text NOT NULL CHECK (type IN ('jeep','flight','visa','safety')),
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
  item_type        text NOT NULL DEFAULT 'tour' CHECK (item_type IN ('tour','hotel','transport')),
  tour_id          bigint REFERENCES tours(id) ON DELETE SET NULL,
  hotel_id         bigint REFERENCES hotels(id) ON DELETE SET NULL,
  transport_id     bigint REFERENCES transport_options(id) ON DELETE SET NULL,
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text,
  preferred_date   date,
  guests           smallint DEFAULT 1,
  special_requests text,
  status           text DEFAULT 'new' CHECK (status IN ('new','contacted','confirmed','cancelled')),
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

-- ============= 4. RLS OFF + GRANT FULL ACCESS =============
ALTER TABLE users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations          DISABLE ROW LEVEL SECURITY;
ALTER TABLE tours              DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotels             DISABLE ROW LEVEL SECURITY;
ALTER TABLE transport_options  DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages   DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ============= 5. ADMIN ACCOUNT =============
-- Login: admin@gmail.com
-- Password: 2026baitur
INSERT INTO users (name, email, role, password_hash, image)
VALUES (
  'Administrator',
  'admin@gmail.com',
  'admin',
  crypt('2026baitur', gen_salt('bf', 10)),
  'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=c9a84c'
);

-- ============= 6. LOCATIONS (6 направлений) =============
INSERT INTO locations (slug, category, image_url, name_en, name_ru, name_ky, region_en, region_ru, region_ky, desc_en, desc_ru, desc_ky, featured, sort_order) VALUES
('kel-suu',       'lakes',     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Kel-Suu Lake',     'Озеро Кел-Суу',    'Кел-Суу Көлү',     'Naryn Oblast',       'Нарынская область',       'Нарын облусу', 'A hidden turquoise gem near the Chinese border.', 'Скрытая бирюзовая жемчужина у китайской границы.', 'Кытай чек арасынын жанындагы жашырын феруза.', true,  1),
('skazka-canyon', 'canyons',   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Skazka Canyon',    'Каньон Сказка',    'Сказка Каньону',   'Issyk-Kul Oblast',   'Иссык-Кульская область',  'Ысык-Көл облусу', 'Fairy-tale red sandstone formations.', 'Сказочные формации из красного песчаника.', 'Эртектеги кызыл кумташ формациялары.', true,  2),
('tash-rabat',    'history',   'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&q=80', 'Tash-Rabat',       'Таш-Рабат',        'Таш-Рабат',        'Naryn Oblast',       'Нарынская область',       'Нарын облусу', '15th-century stone caravanserai on the Silk Road.', 'Каменный каравансарай XV века на Шёлковом пути.', 'Жибек жолундагы XV кылымдагы таш керме-сарай.', true,  3),
('enilchek',      'mountains', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', 'Enilchek Glacier', 'Ледник Энилчек',   'Энилчек Мөңгүсү',  'Issyk-Kul Oblast',   'Иссык-Кульская область',  'Ысык-Көл облусу', 'One of the largest non-polar glaciers in the world.', 'Один из крупнейших непolar ледников мира.', 'Дүйнөдөгү эң чоң мөңгүлөрдүн бири.', true,  4),
('son-kul',       'lakes',     'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', 'Son-Kul Lake',     'Озеро Сон-Куль',   'Сон-Күл Көлү',     'Naryn Oblast',       'Нарынская область',       'Нарын облусу', 'High-altitude nomadic pasture lake at 3,016 m.', 'Высокогорное кочевое пастбищное озеро на 3016 м.', '3016 м бийиктиктеги жайыт көлү.', false, 5),
('sary-jaz',      'mountains', 'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80', 'Sary-Jaz Valley',  'Долина Сары-Жаз',  'Сары-Жаз Өрөөнү',  'Issyk-Kul Oblast',   'Иссык-Кульская область',  'Ысык-Көл облусу', 'Remote alpine valleys with 7,000 m walls.', 'Отдалённые альпийские долины с 7000 м стенами.', '7000 м дубалдары бар алыскы өрөөндөр.', false, 6);

-- ============= 7. TOURS (4 тура) =============
INSERT INTO tours (slug, duration_days, price_usd, difficulty, group_min, group_max, rating, reviews_count, image_url, name_en, name_ru, name_ky, desc_en, desc_ru, desc_ky, includes_en, includes_ru, includes_ky) VALUES
('kel-suu-explorer',    7,  890.00,  'Moderate', 2,  8, 4.9, 47, 'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80', 'Kel-Suu & Tash-Rabat Explorer',  'Тур Кел-Суу и Таш-Рабат',          'Кел-Суу жана Таш-Рабат саякаты',     'Discover the hidden turquoise lake and ancient caravanserai.', 'Откройте скрытое озеро и древний каравансарай.', 'Жашырын көлдү жана байыркы керме-сарайды ачыңыз.', '["Guide","Transport","Yurt Stays","Meals","Permits"]'::jsonb, '["Гид","Транспорт","Юрты","Питание","Разрешения"]'::jsonb,  '["Гид","Транспорт","Боз үй","Тамак-аш","Уруксаттар"]'::jsonb),
('enilchek-expedition', 12, 2400.00, 'Hard',     2,  6, 5.0, 18, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Enilchek Glacier Expedition',    'Экспедиция на ледник Энилчек',     'Энилчек мөңгүсүнө экспедиция',       'Epic 12-day expedition with helicopter access.', 'Эпическая 12-дневная экспедиция с вертолётом.', 'Вертолёт менен 12 күндүк экспедиция.', '["Helicopter","Guide","Camp Equipment","Meals","Insurance"]'::jsonb, '["Вертолёт","Гид","Снаряжение","Питание","Страховка"]'::jsonb, '["Вертолёт","Гид","Жабдуулар","Тамак-аш","Камсыздандыруу"]'::jsonb),
('issyk-kul-discovery', 5,  550.00,  'Easy',     2, 12, 4.8, 92, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', 'Issyk-Kul Discovery Loop',       'Путешествие вокруг Иссык-Куля',    'Ысык-Көл айлануу саякаты',           'Circle the world''s second-largest alpine lake in 5 days.', 'Объедьте второе горное озеро мира за 5 дней.', '5 күндө Ысык-Көлдү айлануу.', '["Guide","Transport","Hotel","Breakfast"]'::jsonb, '["Гид","Транспорт","Отель","Завтрак"]'::jsonb, '["Гид","Транспорт","Мейманкана","Эртеңки тамак"]'::jsonb),
('nomadic-life',        9,  1250.00, 'Moderate', 2,  8, 4.9, 33, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Nomadic Life & Eagle Hunting',   'Кочевая жизнь и охота с беркутом', 'Көчмөн жашоо жана бүркүт мергенчилик', 'Authentic nomadic culture for 9 days with herder families.', 'Подлинная кочевая культура 9 дней с семьями.', 'Чыныгы көчмөн маданияты 9 күн.', '["Guide","Yurt Stays","Eagle Show","Meals","Horse Riding"]'::jsonb, '["Гид","Юрты","Беркутчи","Питание","Верховая езда"]'::jsonb, '["Гид","Боз үй","Бүркүтчү","Тамак-аш","Ат жарыш"]'::jsonb);

-- ============= 8. HOTELS (6 отелей) =============
INSERT INTO hotels (slug, type, price_per_night, rating, reviews_count, image_url, name_en, name_ru, name_ky, location_en, location_ru, location_ky, amenities) VALUES
('yurt-camp-kel-suu',    'yurt',       85.00,  4.9,  64, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'Yurt Camp Kel-Suu',    'Юрточный лагерь Кел-Суу', 'Кел-Суу боз үй лагери', 'Naryn Oblast',     'Нарынская область',     'Нарын облусу',     '["meals","transfer","horse_riding"]'::jsonb),
('khan-tengri-lodge',    'lodge',     145.00,  4.8,  41, 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80', 'Khan Tengri Lodge',    'Хан Тенгри Лодж',         'Хан Теңир Лодж',        'Karakol',          'Каракол',               'Каракол',          '["wifi","spa","transfer","meals"]'::jsonb),
('issyk-kul-boutique',   'hotel',     220.00,  5.0,  28, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 'Issyk-Kul Boutique',   'Иссык-Куль Бутик',        'Ысык-Көл Бутик',        'Cholpon-Ata',      'Чолпон-Ата',            'Чолпон-Ата',       '["wifi","pool","meals","transfer","spa"]'::jsonb),
('tash-rabat-guesthouse','guesthouse', 55.00,  4.7,  83, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'Tash-Rabat Guesthouse','Гостевой дом Таш-Рабат', 'Таш-Рабат конок үй',     'Naryn',            'Нарын',                 'Нарын',            '["meals","transfer"]'::jsonb),
('son-kul-sky-camp',     'yurt',       95.00,  4.9,  52, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', 'Son-Kul Sky Camp',     'Скай Кэмп Сон-Куль',     'Сон-Күл Асман Лагери',  'Naryn Oblast',     'Нарынская область',     'Нарын облусу',     '["meals","horse_riding","transfer"]'::jsonb),
('bishkek-luxe-hotel',   'hotel',     180.00,  4.8, 107, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', 'Bishkek Luxe Hotel',   'Бишкек Люкс Отель',       'Бишкек Люкс Мейманкана','Bishkek',          'Бишкек',                'Бишкек',           '["wifi","pool","spa","meals","transfer"]'::jsonb);

-- ============= 9. TRANSPORT OPTIONS (4 типа) =============
INSERT INTO transport_options (type, icon, title_en, title_ru, title_ky, desc_en, desc_ru, desc_ky, sort_order) VALUES
('jeep',   'Car',      '4×4 Jeep Rentals',  'Аренда внедорожников 4×4', '4×4 Жип ижарасы',           'Rugged off-road vehicles with experienced local drivers.',     'Мощные внедорожники с опытными водителями.',          'Тажрыйбалуу айдоочулар менен унаалар.',                1),
('flight', 'Plane',    'Domestic Flights',  'Внутренние рейсы',         'Ички рейстер',              'Flights connecting Bishkek to Osh and regional cities.',       'Рейсы между Бишкеком, Ошом и регионами.',             'Бишкек, Ош жана аймактарды байланыштырган рейстер.',   2),
('visa',   'FileText', 'Visa Information',  'Визовая информация',       'Виза маалыматы',            'E-visa and visa-free entry for 60+ nationalities.',            'Электронная виза и безвизовый въезд для 60+ стран.',  '60+ улуттук үчүн электрондук виза.',                   3),
('safety', 'Shield',   'Safety & Tips',     'Безопасность и советы',    'Коопсуздук жана кеңештер',  'Altitude acclimatisation and emergency contacts.',             'Высотная акклиматизация и экстренные контакты.',      'Бийиктикке адаптация жана өзгөчө кырдаал.',            4);

-- ============= 10. SAMPLE BOOKINGS (8 заявок) =============
INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status) VALUES
('tour',      1,    NULL, NULL, 'Alex Johnson',     'alex.johnson@email.com',  '+1 555 0101',       '2026-07-15', 2, 'Vegetarian meals please',                  'confirmed'),
('tour',      2,    NULL, NULL, 'Marie Dubois',     'marie.dubois@email.com',  '+33 6 12 34 56 78', '2026-08-01', 4, 'Need porter service',                       'contacted'),
('hotel',     NULL, 3,    NULL, 'Chen Wei',         'chen.wei@email.com',      '+86 138 0000 1234', '2026-07-20', 2, 'Anniversary trip — room upgrade if possible','confirmed'),
('tour',      3,    NULL, NULL, 'Sven Eriksson',    'sven@eriksson.se',        '+46 70 123 4567',   '2026-06-10', 6, 'Group of friends, first-time hikers',       'new'),
('tour',      4,    NULL, NULL, 'Fatima Al-Hassan', 'fatima@example.com',      '+971 50 123 4567',  '2026-09-05', 3, 'Halal food required',                       'new'),
('hotel',     NULL, 1,    NULL, 'James Wilson',     'j.wilson@travel.com',     '+44 20 1234 5678',  '2026-07-28', 2, 'Early check-in if possible',                'confirmed'),
('transport', NULL, NULL, 1,    'Pedro Costa',      'pedro@costa.com.br',      '+55 11 91234 5678', '2026-08-15', 1, 'English-speaking driver',                   'contacted'),
('tour',      1,    NULL, NULL, 'Yuki Tanaka',      'yuki.tanaka@jp.com',      '+81 90 1234 5678',  '2026-10-01', 2, 'Photography focused — slow pace',           'new');

-- ============= 11. SAMPLE CONTACT MESSAGES (6 сообщений) =============
INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES
('Sarah Connor',    'sarah@future.net',         'Custom Tour Request',     'I''d like to plan a custom 14-day trip combining Enilchek glacier and nomadic culture.', true),
('Thomas Mueller',  'thomas.m@gmail.de',        'Group Booking — 15 people','Corporate team-building adventure for 15 people in August 2026. Group discount?', false),
('Anita Sharma',    'anita.sharma@india.in',    'Honeymoon Package',       'Romantic honeymoon experience for September. What do you recommend?', false),
('John Smith',      'john.smith@uk.com',        'Solo Trip Inquiry',       'Planning a solo trekking adventure in Kyrgyzstan for 2 weeks. Budget around $1500.', false),
('Elena Volkova',   'elena.v@russia.ru',        'Family with Children',    'We are a family of 4 (kids 8 and 12). What tours are kid-friendly?', true),
('Hassan Ahmed',    'hassan@uae.ae',            'Photography Tour',        'Professional photographer looking for unique landscape spots and yurt stays.', false);

-- =====================================================================
-- 🎉 ГОТОВО!
--
-- Что было создано:
--   • 7 таблиц (users, locations, tours, hotels, transport_options,
--     bookings, contact_messages)
--   • Админ-аккаунт: admin@gmail.com / 2026baitur
--   • 6 локаций, 4 тура, 6 отелей, 4 транспорта
--   • 8 тестовых бронирований
--   • 6 контактных сообщений
--   • RLS отключён, anon и authenticated имеют полные права
--
-- ПРОВЕРИТЬ:
--   SELECT count(*) FROM tours;     -- 4
--   SELECT count(*) FROM hotels;    -- 6
--   SELECT count(*) FROM locations; -- 6
--   SELECT count(*) FROM bookings;  -- 8
--   SELECT email, role FROM users;  -- admin@gmail.com | admin
--
-- ВОЙТИ НА САЙТ:
--   Login → Sign In
--   Email: admin@gmail.com
--   Password: 2026baitur
-- =====================================================================
