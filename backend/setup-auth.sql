-- =====================================================================
-- ОБЯЗАТЕЛЬНО запустите в Supabase SQL Editor
-- https://supabase.com/dashboard/project/teiszkztlzcrxmudcbiz/sql/new
--
-- Что делает:
-- 1. Включает RLS-фикс (если не запускали fix-rls.sql)
-- 2. Добавляет колонку password_hash в users
-- 3. Создаёт админский аккаунт: admin@gmail.com / admin123
-- =====================================================================

-- ---------- 1. Отключаем RLS (на случай если не делали) ----------
ALTER TABLE IF EXISTS users              DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tours              DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hotels             DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transport_options  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages   DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;

-- ---------- 2. Включаем pgcrypto для bcrypt ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- 3. Добавляем password_hash в users ----------
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- ---------- 4. Создаём админский аккаунт ----------
-- Email:    admin@gmail.com
-- Password: 2026baitur
--
-- bcrypt-хеш сгенерирован через crypt('2026baitur', gen_salt('bf'))
INSERT INTO users (name, email, role, password_hash, image)
VALUES (
  'Administrator',
  'admin@gmail.com',
  'admin',
  crypt('2026baitur', gen_salt('bf', 10)),
  'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=c9a84c'
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = crypt('2026baitur', gen_salt('bf', 10)),
  name = 'Administrator';

-- =====================================================================
-- Готово! Проверьте:
-- SELECT email, role, password_hash IS NOT NULL as has_password FROM users WHERE email = 'admin@gmail.com';
--
-- Должно вернуть:
--   admin@gmail.com | admin | true
--
-- Войти через сайт:
--   1. Откройте http://localhost:3000/en
--   2. Login → Sign In tab
--   3. Email: admin@gmail.com
--   4. Password: 2026baitur
-- =====================================================================
