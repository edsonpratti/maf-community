# MAF Community Workspace Setup

## Progress Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements - Next.js 14 + Supabase social platform
- [x] Scaffold the Project - Manual setup complete with all config files
- [x] Customize the Project - Full structure with auth, feed, materials, admin
- [x] Install Required Extensions - Not required for this project
- [x] Compile the Project - Dependencies installed successfully
- [x] Create and Run Task - Dev server running on http://localhost:3000
- [x] Launch the Project - Server started successfully
- [x] Ensure Documentation is Complete - README.md and SUPABASE_SETUP.md created

## Project Stack
- Next.js 15.5+ (App Router) + TypeScript
- Supabase (Auth + Database + Storage + RLS)
- TailwindCSS + shadcn/ui components
- React Hook Form + Zod for validation
- Vercel deployment ready

## What's Been Built

### ✅ Completed Features
- Complete authentication system (register, login, logout)
- User onboarding flow with certificate upload
- Status-based access control (PENDING → UNDER_REVIEW → ACTIVE)
- Feed page with user posts
- Materials library page
- User profile page with stats
- API routes for posts, comments, reactions
- Hotmart webhook integration
- Full Row Level Security (RLS) policies
- Authentication middleware
- Database migrations ready

### 📂 Project Structure
```
maf-community/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── app/              # Protected app pages (feed, materials, profile)
│   ├── api/              # API routes (posts, hotmart, materials)
│   ├── onboarding/       # User onboarding flow
│   └── status/           # Status verification page
├── components/ui/        # Reusable UI components (shadcn)
├── lib/
│   ├── supabase/         # Supabase client helpers
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
├── supabase/migrations/  # Database migrations
└── docs/
    ├── README.md         # Main documentation
    └── SUPABASE_SETUP.md # Supabase configuration guide
```

## Next Steps to Start Development

1. **Configure Supabase** (see SUPABASE_SETUP.md):
   - Create Supabase project
   - Run migrations
   - Setup storage buckets (certificates, avatars, post-media)
   - Configure storage policies
   - Get API credentials

2. **Setup Environment**:
   ```bash
   cp .env.local.example .env.local
   # Add your Supabase credentials
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   # Server is at http://localhost:3000
   ```

4. **Test the Flow**:
   - Register a new user
   - Complete onboarding (upload certificate)
   - Check status page
   - Manually set user to ACTIVE in Supabase
   - Access the feed

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Important Notes

- The server is **already running** on http://localhost:3000
- TypeScript errors in IDE are expected until Supabase types are properly configured
- RLS policies are strict - users must have `status_access='ACTIVE'` to access feed
- All API routes require authentication
- Hotmart webhook endpoint: `/api/hotmart/webhook`

## Resources

- [README.md](../README.md) - Complete project documentation
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) - Step-by-step Supabase configuration
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
