-- ============================================================
-- БЫСТРЫЙ ФИКС RLS — запустите ЭТО в Supabase SQL Editor
-- если не хотите пересоздавать таблицы из supabase-schema.sql
--
-- Запуск:
-- https://supabase.com/dashboard/project/teiszkztlzcrxmudcbiz/sql/new
-- ============================================================

-- Отключаем RLS на всех таблицах (приложение делает все запросы server-side)
ALTER TABLE IF EXISTS users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tours              DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hotels             DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_options  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages   DISABLE ROW LEVEL SECURITY;

-- Даём полный доступ anon и authenticated ролям
GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Гарантируем что будущие таблицы тоже будут доступны
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ============================================================
-- Готово! Теперь:
-- 1. Перезайдите через Google на сайте
-- 2. Первый пользователь автоматически становится админом (см. auth.ts)
-- 3. Откройте /en/admin
-- ============================================================
