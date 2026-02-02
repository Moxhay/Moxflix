# Moxflix

A modern streaming platform built with Next.js 16, featuring a Netflix-like interface for browsing movies and TV series.

![Moxflix Hero](./screenshots/hero.png)

![Moxflix Feed](./screenshots/feed.png)

## About

Moxflix is an evolution of my final degree project (TFG), where I migrated from a React SPA to Next.js 16 with App Router, from JavaScript to TypeScript, and from Strapi to a custom API with Prisma/PostgreSQL.

### Improvements from the original project:
- Server-Side Rendering with Next.js App Router
- Full type safety with TypeScript
- Custom database with Prisma ORM
- Secure session-based authentication (httpOnly cookies)
- Video playback progress tracking
- Infinite scroll with cursor-based pagination

## Features

- **Authentication** - Secure sessions with bcrypt password hashing and remember me
- **Home Feed** - Hero slider, continue watching, and mixed content feed
- **Catalog** - Browse movies and series with infinite scroll
- **Series Detail** - Seasons, episodes, and per-episode progress tracking
- **Video Player** - Custom player with progress saving and keyboard shortcuts
- **My List** - Save and manage favorites
- **Search** - Real-time search across all content

![Series Detail](./screenshots/detail.png)

![Video Player](./screenshots/player.png)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS v4 |
| State Management | React Query (TanStack Query) |
| Authentication | Custom sessions + bcrypt |
| External API | TMDB (The Movie Database) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── favorites/     # Favorites management
│   │   ├── movies/        # Movies endpoints
│   │   ├── series/        # Series endpoints
│   │   └── progress/      # Watch progress tracking
│   ├── movies/            # Movies pages
│   ├── series/            # Series pages
│   ├── my-list/           # Favorites page
│   └── search/            # Search page
├── components/            # React components
│   ├── auth/              # Auth forms
│   ├── hero/              # Hero slider
│   ├── media/             # Media cards, grids, details
│   ├── nav/               # Navigation components
│   ├── player/            # Video player
│   └── ui/                # Shared UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── auth/              # Auth utilities
│   └── validations/       # Zod schemas
├── providers/             # React context providers
└── types/                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- TMDB API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/moxflix.git
cd moxflix
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/moxflix"
BEARER_TMDB_API_KEY="your_tmdb_bearer_token"
```

4. Set up database and seed with TMDB data
```bash
npx prisma db push
npx prisma db seed
```

5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |

## Database Schema

```
User ─────────────┬─── Favorite ───┬─── Movie
                  │                │
                  ├─── Progress ───┼─── Episode
                  │                │
                  └─── Session     └─── Series
                                        │
                                        └─── Season
                                              │
                                              └─── Episode
```

## License

This project is for educational and portfolio purposes.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie and series data
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling utilities
