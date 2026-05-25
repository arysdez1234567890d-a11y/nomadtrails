# NomadTrails — Kyrgyzstan Travel Website

Премиум туристический сайт по Кыргызстану. Туры, отели, бронирования, многоязычность (EN/RU/KY), админ-панель.

**Стек:** Next.js 15 · TypeScript · Supabase (PostgreSQL) · NextAuth v5 · Tailwind 4 · Framer Motion · GSAP

---

## 🚀 Запуск с нуля (на новом компьютере)

### Шаг 1. Склонируй репозиторий
```bash
git clone https://github.com/akbaralievernis/nomadtrails.git
cd nomadtrails
```

### Шаг 2. Установи зависимости
```bash
npm install --legacy-peer-deps
```

### Шаг 3. Создай файл `.env.local`
Скопируй `.env.example` → `.env.local`, заполни значения:

```env
# Supabase (из Settings → API в Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXXX

# NextAuth — обязательно стабильный 32+ символьный секрет
# Сгенерируй: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=ваш_сгенерированный_секрет

# Google OAuth (опционально, если не нужен — оставь пустым)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### Шаг 4. Запусти SQL-схему в Supabase (только один раз)

Открой **https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new**

Выполни последовательно (Run для каждого):

1. **`backend/supabase-schema.sql`** — создаёт все таблицы
2. **`backend/seed-data.sql`** — добавляет демо-туры/отели/бронирования
3. **`backend/setup-auth.sql`** — добавляет поле `password_hash` + создаёт админа

### Шаг 5. Запусти приложение
```bash
npm run dev
```

Открой **http://localhost:3000/en**

---

## 🔑 Учётные данные администратора

После запуска `setup-auth.sql`:

| Поле | Значение |
|------|----------|
| **Email** | `admin@gmail.com` |
| **Password** | `2026baitur` |

Вход: кнопка **Login** в navbar → вкладка **Sign In** → введите email/пароль.

После входа в **профиле** появится золотая карточка **"Open Admin Panel"** — клик → попадёте в админку.

---

## 👤 Регистрация обычных пользователей

Любой посетитель может зарегистрироваться:
1. Кнопка **Login** в navbar
2. Вкладка **Register**
3. Имя + email + пароль (минимум 6 символов)
4. Готово — автоматически логинит

Обычные пользователи получают роль `user` (не админ).

---

## 🔄 Передача проекта другому человеку

### Вариант A: они используют ту же Supabase базу
Просто дай им:
1. Доступ к этому GitHub репо
2. Скопируй им `.env.local` (или скажи скопировать у себя)

Они выполнят шаги 1, 2, 5. SQL уже в БД — не нужно перезапускать.

### Вариант B: они создают свой Supabase проект (более правильно)
1. Они создают новый проект на https://supabase.com
2. Settings → API → копируют URL и `anon/publishable key`
3. Создают свой `.env.local` с новыми значениями
4. Запускают все 3 SQL из `backend/` в своём Supabase
5. `npm install && npm run dev`

В обоих случаях админ-аккаунт `admin@gmail.com / 2026baitur` создаётся через `setup-auth.sql`.

---

## 📁 Структура проекта

```
src/
├── app/
│   ├── [locale]/           ← страницы EN/RU/KY
│   │   ├── page.tsx        ← главная
│   │   ├── profile/        ← личный кабинет
│   │   └── admin/          ← админ-панель (только role='admin')
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/  ← NextAuth handler
│       │   └── register/       ← регистрация email/password
│       ├── admin/          ← admin-only API: users, messages, stats, activity
│       └── bookings/       ← бронирования
├── components/             ← React UI компоненты
├── lib/supabase.ts         ← Supabase клиент
└── auth.ts                 ← NextAuth конфиг (Credentials + Google)

backend/
├── supabase-schema.sql     ← полная схема БД + RLS off + начальные данные
├── seed-data.sql           ← только демо-данные (без пересоздания)
├── setup-auth.sql          ← password_hash + админ-аккаунт
└── fix-rls.sql             ← быстрый фикс RLS (если только это нужно)

messages/
├── en.json / ru.json / ky.json   ← переводы
```

---

## 🛠 Полезные команды

```bash
npm run dev      # dev-сервер (рекомендуется для разработки)
npm run build    # production build
npm start        # production server (требует build)
npm run lint     # ESLint
```

---

## 🔐 Безопасность

- Пароли хешируются bcrypt (10 rounds) — никогда не хранятся в plaintext
- Сессии — JWT, подписанные `AUTH_SECRET`, живут 30 дней
- Admin-роли проверяются и в middleware (страницы), и в API роутах
- Supabase RLS отключён (все DB-запросы делаются server-side)

**Перед продакшеном:**
- [ ] Смени `AUTH_SECRET` на свежий случайный
- [ ] Смени пароль админа `admin@gmail.com` на стойкий
- [ ] Подключи свой домен с HTTPS (AUTH_URL=https://yourdomain.com)
- [ ] Настрой реальный Google OAuth (если нужен)
