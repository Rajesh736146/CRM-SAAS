# CRM SaaS

A full-stack CRM built with Next.js 14, Prisma, NextAuth, and Tailwind CSS.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (credentials)
- **Styling**: Tailwind CSS
- **Validation**: Zod + React Hook Form

## Features

- Multi-tenant (organization-based)
- Contacts management
- Companies management
- Deals pipeline (Kanban view)
- Activities tracking (calls, emails, meetings, tasks, notes)
- Dashboard with stats
- Role-based access (Owner, Admin, Member)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy env file and fill in values:
   ```bash
   cp .env.example .env
   ```

3. Push the database schema:
   ```bash
   pnpm db:push
   ```

4. Run the dev server:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) and register your account.
