-- ============================================================
-- SEED DATA ONLY — добавляет демо-данные без удаления таблиц
-- Запустите ПОСЛЕ fix-rls.sql
--
-- Запуск:
-- https://supabase.com/dashboard/project/teiszkztlzcrxmudcbiz/sql/new
--
-- ON CONFLICT DO NOTHING — повторный запуск безопасен, дубликаты не создаются.
-- ============================================================

-- =========== LOCATIONS ===========
INSERT INTO locations (slug, category, image_url, name_en, name_ru, name_ky, region_en, region_ru, region_ky, desc_en, desc_ru, desc_ky, featured, sort_order) VALUES
('kel-suu', 'lakes', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Kel-Suu Lake', 'Озеро Кел-Суу', 'Кел-Суу Көлү', 'Naryn Oblast', 'Нарынская область', 'Нарын облусу', 'A hidden turquoise gem near the Chinese border.', 'Скрытая бирюзовая жемчужина у китайской границы.', 'Кытай чек арасынын жанындагы жашырын феруза.', true, 1),
('skazka-canyon', 'canyons', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Skazka Canyon', 'Каньон Сказка', 'Сказка Каньону', 'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу', 'Fairy-tale red sandstone formations.', 'Сказочные формации из красного песчаника.', 'Эртектеги кызыл кумташ формациялары.', true, 2),
('tash-rabat', 'history', 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&q=80', 'Tash-Rabat', 'Таш-Рабат', 'Таш-Рабат', 'Naryn Oblast', 'Нарынская область', 'Нарын облусу', '15th-century stone caravanserai on the Silk Road.', 'Каменный каравансарай XV века на Шёлковом пути.', 'Жибек жолундагы XV кылымдагы таш керме-сарай.', true, 3),
('enilchek', 'mountains', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', 'Enilchek Glacier', 'Ледник Энилчек', 'Энилчек Мөңгүсү', 'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу', 'One of the largest non-polar glaciers, in Tian Shan.', 'Один из крупнейших непolar ледников мира.', 'Тянь-Шааньдагы дүйнөдөгү эң чоң мөңгүлөрдүн бири.', true, 4),
('son-kul', 'lakes', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', 'Son-Kul Lake', 'Озеро Сон-Куль', 'Сон-Күл Көлү', 'Naryn Oblast', 'Нарынская область', 'Нарын облусу', 'High-altitude nomadic pasture lake at 3,016 m.', 'Высокогорное кочевое пастбищное озеро на 3016 м.', '3016 м бийиктиктеги жогорку тоолуу жайыт көлү.', false, 5),
('sary-jaz', 'mountains', 'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80', 'Sary-Jaz Valley', 'Долина Сары-Жаз', 'Сары-Жаз Өрөөнү', 'Issyk-Kul Oblast', 'Иссык-Кульская область', 'Ысык-Көл облусу', 'Remote alpine valleys with 7,000 m walls.', 'Отдалённые альпийские долины с 7000 м стенами.', '7000 м тик дубалдары бар алыскы өрөөндөр.', false, 6)
ON CONFLICT (slug) DO NOTHING;

-- =========== TOURS ===========
INSERT INTO tours (slug, duration_days, price_usd, difficulty, group_min, group_max, rating, reviews_count, image_url, name_en, name_ru, name_ky, desc_en, desc_ru, desc_ky, includes_en, includes_ru, includes_ky) VALUES
('kel-suu-explorer', 7, 890.00, 'Moderate', 2, 8, 4.9, 47, 'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=800&q=80', 'Kel-Suu & Tash-Rabat Explorer', 'Тур Кел-Суу и Таш-Рабат', 'Кел-Суу жана Таш-Рабат саякаты', 'Discover the hidden turquoise lake and ancient caravanserai.', 'Откройте скрытое озеро и древний каравансарай.', 'Жашырын көлдү жана байыркы керме-сарайды ачыңыз.', '["Guide","Transport","Yurt Stays","Meals","Permits"]', '["Гид","Транспорт","Юрты","Питание","Разрешения"]', '["Гид","Транспорт","Боз үй","Тамак-аш","Уруксаттар"]'),
('enilchek-expedition', 12, 2400.00, 'Hard', 2, 6, 5.0, 18, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Enilchek Glacier Expedition', 'Экспедиция на ледник Энилчек', 'Энилчек мөңгүсүнө экспедиция', 'Epic 12-day expedition with helicopter access.', 'Эпическая 12-дневная экспедиция с вертолётом.', 'Вертолёт менен 12 күндүк эпикалык экспедиция.', '["Helicopter","Guide","Camp Equipment","Meals","Insurance"]', '["Вертолёт","Гид","Снаряжение","Питание","Страховка"]', '["Вертолёт","Гид","Жабдуулар","Тамак-аш","Камсыздандыруу"]'),
('issyk-kul-discovery', 5, 550.00, 'Easy', 2, 12, 4.8, 92, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', 'Issyk-Kul Discovery Loop', 'Путешествие вокруг Иссык-Куля', 'Ысык-Көл айлануу саякаты', 'Circle the worlds second-largest alpine lake in 5 relaxed days.', 'Объедьте второе горное озеро мира за 5 дней.', 'Дүйнөдөгү экинчи эң чоң тоо көлүн айланып чыгыңыз.', '["Guide","Transport","Hotel","Breakfast"]', '["Гид","Транспорт","Отель","Завтрак"]', '["Гид","Транспорт","Мейманкана","Эртеңки тамак"]'),
('nomadic-life', 9, 1250.00, 'Moderate', 2, 8, 4.9, 33, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', 'Nomadic Life & Eagle Hunting', 'Кочевая жизнь и охота с беркутом', 'Көчмөн жашоо жана бүркүт мергенчилик', 'Authentic nomadic culture for 9 days with herder families.', 'Подлинная кочевая культура 9 дней с семьями.', 'Чыныгы көчмөн маданияты 9 күн малчы үй-бүлөлөрү менен.', '["Guide","Yurt Stays","Eagle Show","Meals","Horse Riding"]', '["Гид","Юрты","Беркутчи","Питание","Верховая езда"]', '["Гид","Боз үй","Бүркүтчү","Тамак-аш","Ат жарыш"]')
ON CONFLICT (slug) DO NOTHING;

-- =========== HOTELS ===========
INSERT INTO hotels (slug, type, price_per_night, rating, reviews_count, image_url, name_en, name_ru, name_ky, location_en, location_ru, location_ky, amenities) VALUES
('yurt-camp-kel-suu', 'yurt', 85.00, 4.9, 64, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', 'Yurt Camp Kel-Suu', 'Юрточный лагерь Кел-Суу', 'Кел-Суу боз үй лагери', 'Naryn Oblast', 'Нарынская область', 'Нарын облусу', '["meals","transfer","horse_riding"]'),
('khan-tengri-lodge', 'lodge', 145.00, 4.8, 41, 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=800&q=80', 'Khan Tengri Lodge', 'Хан Тенгри Лодж', 'Хан Теңир Лодж', 'Karakol', 'Каракол', 'Каракол', '["wifi","spa","transfer","meals"]'),
('issyk-kul-boutique', 'hotel', 220.00, 5.0, 28, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80', 'Issyk-Kul Boutique', 'Иссык-Куль Бутик', 'Ысык-Көл Бутик', 'Cholpon-Ata', 'Чолпон-Ата', 'Чолпон-Ата', '["wifi","pool","meals","transfer","spa"]'),
('tash-rabat-guesthouse', 'guesthouse', 55.00, 4.7, 83, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', 'Tash-Rabat Guesthouse', 'Гостевой дом Таш-Рабат', 'Таш-Рабат конок үй', 'Naryn', 'Нарын', 'Нарын', '["meals","transfer"]'),
('son-kul-sky-camp', 'yurt', 95.00, 4.9, 52, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80', 'Son-Kul Sky Camp', 'Скай Кэмп Сон-Куль', 'Сон-Күл Асман Лагери', 'Naryn Oblast', 'Нарынская область', 'Нарын облусу', '["meals","horse_riding","transfer"]'),
('bishkek-luxe-hotel', 'hotel', 180.00, 4.8, 107, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', 'Bishkek Luxe Hotel', 'Бишкек Люкс Отель', 'Бишкек Люкс Мейманкана', 'Bishkek', 'Бишкек', 'Бишкек', '["wifi","pool","spa","meals","transfer"]')
ON CONFLICT (slug) DO NOTHING;

-- =========== TRANSPORT ===========
INSERT INTO transport_options (type, icon, title_en, title_ru, title_ky, desc_en, desc_ru, desc_ky, sort_order) VALUES
('jeep', 'Car', '4×4 Jeep Rentals', 'Аренда внедорожников 4×4', '4×4 Жип ижарасы', 'Rugged off-road vehicles with experienced local drivers.', 'Мощные внедорожники с опытными водителями.', 'Тажрыйбалуу айдоочулар менен күчтүү унаалар.', 1),
('flight', 'Plane', 'Domestic Flights', 'Внутренние рейсы', 'Ички рейстер', 'Flights connecting Bishkek to Osh and regional cities.', 'Рейсы между Бишкеком, Ошом и регионами.', 'Бишкек, Ош жана аймактарды байланыштырган рейстер.', 2),
('visa', 'FileText', 'Visa Information', 'Визовая информация', 'Виза маалыматы', 'E-visa and visa-free entry for 60+ nationalities.', 'Электронная виза и безвизовый въезд для 60+ стран.', '60+ улуттук үчүн электрондук виза.', 3),
('safety', 'Shield', 'Safety & Tips', 'Безопасность и советы', 'Коопсуздук жана кеңештер', 'Altitude acclimatisation and emergency contacts.', 'Высотная акклиматизация и экстренные контакты.', 'Бийиктикке адаптация жана өзгөчө кырдаал байланыштары.', 4)
ON CONFLICT DO NOTHING;

-- =========== SAMPLE BOOKINGS (only inserts if tours/hotels exist) ===========
INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status)
SELECT 'tour', (SELECT id FROM tours WHERE slug='kel-suu-explorer'), NULL, NULL, 'Alex Johnson', 'alex.johnson@email.com', '+1 555 0101', '2025-07-15', 2, 'Vegetarian meals please', 'confirmed'
WHERE EXISTS (SELECT 1 FROM tours WHERE slug='kel-suu-explorer')
AND NOT EXISTS (SELECT 1 FROM bookings WHERE email='alex.johnson@email.com' AND tour_id=(SELECT id FROM tours WHERE slug='kel-suu-explorer'));

INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status)
SELECT 'tour', (SELECT id FROM tours WHERE slug='enilchek-expedition'), NULL, NULL, 'Marie Dubois', 'marie.dubois@email.com', '+33 6 12 34 56 78', '2025-08-01', 4, 'Need porter service', 'contacted'
WHERE EXISTS (SELECT 1 FROM tours WHERE slug='enilchek-expedition')
AND NOT EXISTS (SELECT 1 FROM bookings WHERE email='marie.dubois@email.com');

INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status)
SELECT 'hotel', NULL, (SELECT id FROM hotels WHERE slug='issyk-kul-boutique'), NULL, 'Chen Wei', 'chen.wei@email.com', '+86 138 0000 1234', '2025-07-20', 2, 'Anniversary trip', 'confirmed'
WHERE EXISTS (SELECT 1 FROM hotels WHERE slug='issyk-kul-boutique')
AND NOT EXISTS (SELECT 1 FROM bookings WHERE email='chen.wei@email.com');

INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status)
SELECT 'tour', (SELECT id FROM tours WHERE slug='issyk-kul-discovery'), NULL, NULL, 'Sven Eriksson', 'sven@eriksson.se', '+46 70 123 4567', '2025-06-10', 6, 'Group of friends', 'new'
WHERE EXISTS (SELECT 1 FROM tours WHERE slug='issyk-kul-discovery')
AND NOT EXISTS (SELECT 1 FROM bookings WHERE email='sven@eriksson.se');

INSERT INTO bookings (item_type, tour_id, hotel_id, transport_id, full_name, email, phone, preferred_date, guests, special_requests, status)
SELECT 'tour', (SELECT id FROM tours WHERE slug='nomadic-life'), NULL, NULL, 'Fatima Al-Hassan', 'fatima@example.com', '+971 50 123 4567', '2025-09-05', 3, 'Halal food required', 'new'
WHERE EXISTS (SELECT 1 FROM tours WHERE slug='nomadic-life')
AND NOT EXISTS (SELECT 1 FROM bookings WHERE email='fatima@example.com');

-- =========== CONTACT MESSAGES ===========
INSERT INTO contact_messages (name, email, subject, message, is_read) VALUES
('Sarah Connor', 'sarah@future.net', 'Custom Tour Request', 'I would like to plan a custom 14-day trip combining Enilchek glacier and nomadic culture.', true),
('Thomas Mueller', 'thomas.m@gmail.de', 'Group Booking — 15 people', 'Looking for a team-building adventure in August 2025 for 15 people.', false),
('Anita Sharma', 'anita.sharma@india.in', 'Honeymoon Package', 'Looking for a romantic honeymoon experience in September.', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Готово! Проверьте:
-- SELECT count(*) FROM tours;     -- должно быть 4
-- SELECT count(*) FROM hotels;    -- должно быть 6
-- SELECT count(*) FROM locations; -- должно быть 6
-- SELECT count(*) FROM bookings;  -- должно быть 5
-- ============================================================
