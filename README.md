# pitcrew

for formula electric recruiting. lets you manage the entire recruiting pipeline from applications to team placement.

## tech
- next.js w app router
- postgresql
- prisma
- azure blob storage
- framer motion

## local setup
psql setup (mac):
```bash
brew install postgresql
brew services start postgresql

# create db and user
psql postgres
CREATE DATABASE pitcrew_db OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE pitcrew_db TO your_username;
ALTER USER your_username CREATEDB;
\q
```

## project setup
```
npm install

# setup env
# edit DATABASE_URL in .env to match your psql setup
DATABASE_URL="postgresql://YOURPSQLACCOUNTUSERNAME:YOURPSQLACCOUNTPASSWORD@localhost:PORTNUMBER/pitcrew_db/mydb?schema=public"

# setup db
npx prisma generate
npx prisma db push
npx prisma db seed```
```

## structure
```
pitcrew/
├── app/                      # next.js app router
│   ├── (dashboard)          # (should be protected) dashboard routes
│   ├── (public)             # public routes (apply + landing)
│   ├── layout.tsx           # root layout
│   └── page.tsx             # landing page
├── components/              # react components
│   ├── dashboard/           # dashboard specific components
│   ├── layout/             # layout components (sidebar, etc)
│   └── shared/             # shared components
├── constants/              # shared constants
│   └── questions.ts       # application questions
├── public/
│   └── icons/            # svg icons
└── prisma/               # database stuff
    ├── schema.prisma    # db schema
    └── seed.ts         # seeder
```

## development
```
npm run dev
```

we use css modules for styling, no tailwind.

built by tamu formula electric software subteam 2024-2025.

