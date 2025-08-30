# Vehicle Incidents Management System

A comprehensive incident management system for tracking, reporting, and managing vehicle incidents within a fleet management platform.

## Getting Started

### Prerequisites
- Node.js 18+ (Download from https://nodejs.org/)
- Git (Download from https://git-scm.com/)

### Installation Steps

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Install the LTS version
   - Restart your terminal

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── fleetmanager/      # Frontend pages
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── prisma/               # Database schema
└── public/               # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Prisma + NeonDB (PostgreSQL)
- **UI Library**: Tailwind CSS + Shadcn/UI
- **State Management**: TanStack Query
- **File Upload**: Cloudinary
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="your-neondb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

## Features

### ✅ Must Have Features
- ✅ **Create, read, update incident records** - Full CRUD operations with validation
- ✅ **Image upload and management** - Cloudinary integration with preview and gallery
- ✅ **Status workflow management** - Complete status tracking with notifications
- ✅ **Basic search and filtering** - Advanced search with multiple filter combinations
- ✅ **Responsive UI design** - Mobile-first responsive design

### ✅ Should Have Features
- ✅ **Advanced analytics dashboard** - Comprehensive metrics and visualizations
- ✅ **Incident assignment system** - Manager assignment workflow
- ✅ **Comment/update system** - Real-time comment tracking with audit trail
- ✅ **Export functionality** - CSV export with filtered data
- ✅ **Real-time notifications** - Browser notifications and in-app notification system

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open database browser

## API Endpoints

- `GET /api/incidents` - List incidents with filtering
- `POST /api/incidents` - Create incident
- `GET /api/incidents/[id]` - Get incident details
- `PUT /api/incidents/[id]` - Update incident
- `POST /api/incidents/[id]/updates` - Add comment/update
- `GET /api/incidents/stats` - Get analytics data
- `GET /api/incidents/export` - Export incidents to CSV
- `POST /api/upload` - Upload images
- `GET /api/cars` - List vehicles
- `GET /api/users` - List users

## Deployment

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Set up database: `npm run db:push && npm run db:seed`
5. Run development server: `npm run dev`

### Production Deployment (Vercel)

#### Prerequisites
- GitHub account
- Vercel account (free)
- NeonDB account (free)

#### Steps
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/vehicle-incidents.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL` (from NeonDB)
     - `NEXTAUTH_SECRET` (generate random string)
     - `CLOUDINARY_CLOUD_NAME` (optional)
     - `CLOUDINARY_API_KEY` (optional)
     - `CLOUDINARY_API_SECRET` (optional)
   - Deploy!

3. **Database Setup**
   - The deployment will automatically run migrations and seed data
   - Your app will be live at `https://your-app-name.vercel.app`

### Demo
- **Live Demo**: [Coming Soon]
- **Admin Dashboard**: Navigate to `/fleetmanager/incidents`
