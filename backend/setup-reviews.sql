-- =====================================================================
-- Reviews System Schema Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ---------- 1. Create reviews table ----------
CREATE TABLE IF NOT EXISTS reviews (
  id         bigserial PRIMARY KEY,
  user_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  name       text NOT NULL,
  avatar     text,
  rating     smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ---------- 2. Disable Row Level Security ----------
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- ---------- 3. Grant full access to anon + authenticated roles ----------
GRANT ALL ON TABLE reviews TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE reviews_id_seq TO anon, authenticated, service_role;

-- ---------- 4. Seed sample reviews (Social Proof) ----------
INSERT INTO reviews (name, avatar, rating, comment, created_at)
VALUES
(
  'Emily Watson',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  5,
  'This trip exceeded all my expectations! Kel-Suu is incredibly beautiful, and the horse trekking was organized flawlessly. The guides were extremely knowledgeable, caring, and made us feel safe throughout the mountain passes.',
  now() - interval '2 days'
),
(
  'Дмитрий Иванов',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  5,
  'Великолепный сервис и незабываемые впечатления! Тур Кел-Суу и Таш-Рабат был организован на высшем уровне. Ночевки в юртах под звездным небом и традиционная еда — это то, что обязательно нужно испытать каждому.',
  now() - interval '5 days'
),
(
  'Чыңгыз Кожомкулов',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  4,
  'Кыргызстандын тоолору аябай кооз экен! Уюштуруучуларга чоң рахмат. Ат менен жүрүү жана Көл-Суунун кооздугу жүрөгүмдө түбөлүккө калды. Тейлөө абдан жакшы болду, баарына сунуштайм!',
  now() - interval '10 days'
)
ON CONFLICT DO NOTHING;
