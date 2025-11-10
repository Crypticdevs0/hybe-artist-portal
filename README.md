# HYBE Artist Communication Portal

A premium, enterprise-grade platform connecting K-pop artists with their fans through secure messaging, exclusive content, and real-time interactions.

## Features

- **Authentication**: Secure email/password authentication with Supabase
- **Real-time Messaging**: Direct messaging between members and artists
- **Content Management**: Artists can post updates with subscription-based visibility
- **Social Features**: Like, comment, and engage with artist content
- **Subscription Tiers**: Basic, Premium, and VIP membership levels
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Mobile-First Design**: Fully responsive with HYBE-inspired aesthetics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19.2, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (for deployment)

### Installation

1. Clone the repository or download from v0:
\`\`\`bash
# Using shadcn CLI (recommended)
npx shadcn@latest init

# Or download ZIP from v0 interface
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Set up environment variables:

The project is already connected to Supabase. Environment variables are managed through the v0 interface.

4. Run database migrations:

Execute the SQL scripts in order from the Supabase SQL editor:
- `scripts/001_create_tables.sql`
- `scripts/002_create_functions.sql`
- `scripts/003_seed_data.sql` (optional, for test data)

5. Start development server:
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Project Structure

\`\`\`
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main user dashboard
│   ├── messages/          # Messaging system
│   ├── profile/           # User profile
│   ├── posts/             # Post detail pages
│   ├── artist/            # Artist-specific pages
│   ├── admin/             # Admin panel
│   └── notifications/     # Notifications page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client configuration
├── scripts/               # Database migration scripts
└── public/                # Static assets
\`\`\`

## User Roles

- **Member**: Basic user with access to public content and messaging
- **Artist**: Can create posts, manage content, and engage with fans
- **Admin**: Full platform access including user management

## Subscription Tiers

- **Basic**: Access to all public content
- **Premium**: Access to premium content and features
- **VIP**: Access to all content including VIP-exclusive posts

## Development

### Running locally

\`\`\`bash
npm run dev
\`\`\`

### Building for production

\`\`\`bash
npm run build
npm run start
\`\`\`

### Linting

\`\`\`bash
npm run lint
\`\`\`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will automatically detect Next.js and configure
4. Add environment variables in Vercel dashboard
5. Deploy

The project is optimized for Vercel deployment with:
- Automatic HTTPS
- Global CDN
- Serverless functions
- Edge middleware

## Security

- Row Level Security (RLS) enabled on all database tables
- Secure authentication with Supabase
- Environment variables properly scoped
- No API keys exposed to client
- CSRF protection via JWT tokens

## Performance

- Server-side rendering (SSR) for optimal performance
- Real-time updates with minimal latency
- Optimized images and assets
- Mobile-first responsive design

## Support

For issues or questions:
1. Check `PRODUCTION_READINESS.md` for common issues
2. Review Supabase logs for database errors
3. Check Vercel deployment logs
4. Open support ticket at vercel.com/help

## License

Proprietary - HYBE Corporation

## Acknowledgments

- Built with v0 by Vercel
- UI components by shadcn/ui
- Icons by Lucide React
