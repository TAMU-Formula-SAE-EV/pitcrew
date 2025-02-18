# pitcrew

for formula electric recruiting. lets you manage the entire recruiting pipeline from applications to team placement.

## Tech Stack
- **Next.js** (App Router)
- **PostgreSQL**
- **Prisma**
- **Azure Blob Storage**
- **Framer Motion**

## Local Setup
### Step 1: Install PostgreSQL
#### macOS
```bash
brew install postgresql
brew services start postgresql
```

Verify installation:
```bash
psql --version
```

Access PostgreSQL shell:
```bash
psql postgres
```
If you get a "command not found" error, you may need to add PostgreSQL to your PATH.

#### Windows
Follow official instructions to install PostgreSQL.

### Step 2: Setup Database
```sql
CREATE USER myuser WITH PASSWORD 'mypassword';
CREATE DATABASE pitcrew_db OWNER myuser;
GRANT ALL PRIVILEGES ON DATABASE pitcrew_db TO myuser;
ALTER USER myuser CREATEDB;
```
Exit shell:
```sql
\q
```

### Step 3: Setup Environment Variables
Create a `.env` file in the root of the project and add:
```ini
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/pitcrew_db?schema=public"
```
Replace `myuser`, `mypassword`, and `pitcrew_db` with your actual credentials.

### Step 4: Initialize Prisma
Run the following commands in the root of the project:
```bash
npm install
npm install prisma @prisma/client
npm install ts-node typescript @types/node --save-dev
npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

### Step 5: Seed Database
```bash
npm run seed
```
You should see:
```
Database has been seeded. 🌱
```
Verify database setup with Prisma Studio:
```bash
npx prisma studio
```
Navigate to http://localhost:5555 and check if the seeded data appears.

## Google Authentication Setup
1. Go to [Google Cloud Platform](https://console.cloud.google.com/) and navigate to **APIs & Services**.
2. Create a new project.
3. In the left sidebar, select **OAuth consent screen**:
   - Select **External**.
   - Fill out required fields.
4. Go to **Credentials**:
   - Click **+ Create Credentials** → **OAuth Client ID**.
   - Select **Web Application**.
   - Fill out required fields:
     - **Authorized JavaScript Origins**: `http://localhost:3000` (for local development).
     - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`.
   - Copy the **Client ID** and **Client Secret**, then add them to your `.env`:
     ```ini
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```
5. Generate an authentication secret:
   ```bash
   npx auth secret
   ```
   Add it to your `.env`:
   ```ini
   NEXTAUTH_SECRET=your_generated_secret
   NEXTAUTH_URL=http://localhost:3000
   ADMIN_NET_IDS=[]
   ```
   Add to ADMIN_NET_IDS any authorized NetIDs (as strings) that should be administrators of the application.

## Development
```bash
npm run dev
```

## Project Structure
```
pitcrew/
├── app/                      # Next.js App Router
│   ├── (dashboard)          # (Protected) Dashboard Routes
│   ├── (public)             # Public Routes (Apply + Landing)
│   ├── layout.tsx           # Root Layout
│   └── page.tsx             # Landing Page
├── components/              # React Components
│   ├── dashboard/           # Dashboard-Specific Components
│   ├── layout/              # Layout Components (Sidebar, etc.)
│   └── shared/              # Shared Components
├── constants/               # Shared Constants
│   └── questions.ts         # Application Questions
├── public/
│   └── icons/               # SVG Icons
└── prisma/                  # Database Configuration
    ├── schema.prisma        # DB Schema
    └── seed.ts              # Seeder
```

---
Built by **TAMU Formula Electric Software Subteam** (2024-2025).
