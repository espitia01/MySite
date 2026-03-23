# Notes

A minimalistic website for uploading and sharing PDF notes with markdown explanations. Organize notes into folders and embed images in your explanations.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Supabase** for Postgres database + file storage (PDFs and images)
- **react-markdown** for rendering explanations

## Getting Started

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a free project.

### 2. Create the Database Tables

In the Supabase SQL Editor, run:

```sql
create table folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text default '',
  created_at timestamptz default now()
);

create table notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null default 'other',
  description text default '',
  pdf_url text default '',
  pdf_filename text default '',
  folder_id uuid references folders(id),
  is_draft boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. Create the Storage Buckets

In the Supabase dashboard, go to **Storage** and create two public buckets:

1. **`pdfs`** — for PDF note files
2. **`images`** — for images inserted into explanations

For each bucket: click **New Bucket**, enter the name, toggle **Public bucket** ON, and click **Create bucket**.

### 4. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

You'll need:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret key |
| `ADMIN_PASSWORD` | Any password you choose for the admin panel |

### 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the same environment variables in Vercel project settings
4. Deploy

### Existing Database Migration

If you already have the `notes` table, add the `is_draft` column:

```sql
alter table notes add column is_draft boolean default false;
```

## Usage

- **Public site**: browse notes at `/notes`, view folders at `/folders`, view a note at `/notes/[id]`
- **Admin panel**: go to `/admin`, enter your password, then:
  - Create/edit/delete notes from the dashboard
  - Manage folders at `/admin/folders`
  - Assign notes to folders when creating or editing them
  - Insert images into explanations via the editor toolbar, drag-and-drop, or paste
  - Save notes as drafts (visible only to admin) and publish when ready
