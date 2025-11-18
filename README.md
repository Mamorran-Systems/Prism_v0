# Prism Iterate v0

A single-panel AI console with version history for tracking AI work step-by-step.

## Features

- **Projects & Runs**: Organize work into projects and runs
- **Step Tracking**: Log every AI interaction and manual note as a Step
- **Version History**: Create labeled Revisions that summarize work at checkpoints
- **Multi-Model Support**: Use gpt-4.1, gpt-4.1-mini, or manual notes
- **Dark UI**: Apple/Final Cut Pro-inspired minimal interface

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS
- OpenAI API
- Lucide React (icons)

## Project Structure

- `app/` - Next.js pages and API routes
- `lib/` - Database, LLM, and config utilities
- `prisma/` - Database schema and migrations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

