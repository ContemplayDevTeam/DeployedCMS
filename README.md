# AirTable Queue for Customers

A modern, full-stack image upload and queue management system built with Next.js, featuring Airtable backend integration, Cloudinary image processing, and beautiful Framer Motion animations.

## 🚀 Features

### Core Functionality
- **🖼️ Image Upload & Processing** - Drag-and-drop upload with automatic Cloudinary processing
- **📋 Queue Management** - Real-time queue with drag-and-drop reordering
- **🎨 Interactive UI** - Modern interface with Framer Motion animations
- **👤 User Management** - Email-based authentication with Airtable backend
- **📊 Dashboard Analytics** - User statistics and upload tracking

### Advanced Features
- **🎠 Horizontal Image Carousel** - Smooth scrolling gallery with fixed-width container
- **⚡ Auto-Processing** - Images automatically process when dropped
- **🔄 Real-time Updates** - Live status updates and queue synchronization
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🎯 Smart Constraints** - Intelligent drag boundaries and elastic scrolling

## 🏗️ Project Structure

```
AirTableQueueforCustomers/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── airtable/            # Airtable operations
│   │   │   ├── queue/           # Queue management
│   │   │   │   ├── add/         # Add images to queue
│   │   │   │   ├── bulk-add/    # Bulk operations
│   │   │   │   ├── delete/      # Remove items
│   │   │   │   ├── reorder/     # Drag-and-drop reordering
│   │   │   │   ├── status/      # Status updates
│   │   │   │   └── tags/        # Tag management
│   │   │   └── user/            # User operations
│   │   │       ├── preferences/ # User settings
│   │   │       ├── profile/     # Profile management
│   │   │       └── verify/      # Email verification
│   │   ├── auth/                # Authentication
│   │   │   ├── login/           # User login
│   │   │   └── signup/          # User registration
│   │   ├── cloudinary/          # Image processing
│   │   └── upload/              # File upload handling
│   ├── dashboard/               # User dashboard page
│   ├── landing/                 # Landing page
│   ├── login/                   # Login page
│   ├── signup/                  # Registration page
│   ├── upload/                  # Main upload interface
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/                         # Shared libraries
│   ├── airtable.ts             # Airtable integration class
│   └── cloudinary.ts           # Cloudinary configuration
├── components/                  # Reusable components
├── public/                      # Static assets
├── scripts/                     # Development scripts
│   └── testing/                # Test utilities
├── package.json                # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind CSS config
└── next.config.ts             # Next.js configuration
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions

### Backend & APIs
- **Airtable API** - Database and content management
- **Cloudinary** - Image processing and CDN
- **Next.js API Routes** - Serverless API endpoints

### Key Libraries
- **react-dropzone** - Drag-and-drop file uploads
- **bcryptjs** - Password hashing
- **multer** - File upload handling

## 🏛️ Architecture

### Data Flow
1. **User uploads images** via drag-and-drop interface
2. **Auto-processing triggers** - images immediately sent to processing queue
3. **Cloudinary processing** - images optimized and stored
4. **Airtable storage** - metadata and URLs stored in database
5. **Real-time updates** - UI reflects processing status
6. **Image Bank display** - processed images shown in horizontal carousel

### Backend Integration
- **AirtableBackend Class** (`lib/airtable.ts`) - Centralized API wrapper
- **User Management** - Authentication, profiles, preferences
- **Queue Operations** - CRUD operations for image queue
- **Status Tracking** - Real-time processing status updates

### Frontend Architecture
- **Component-based** - Modular, reusable React components
- **State Management** - React hooks for local state
- **Animation System** - Framer Motion for smooth interactions
- **Responsive Design** - Mobile-first Tailwind CSS

## 🗄️ Database Schema (Airtable)

### Users Table
- `Email` (Primary) - User identification
- `Is Verified` - Email verification status
- `Is Paid` - Subscription status
- `Subscription Tier` - Free/Basic/Pro
- `Total Uploads` - Upload counter
- `Storage Used` - Storage tracking
- `Created Date` - Registration timestamp
- `Last Login` - Activity tracking

### Image Queue Table
- `User Email` - Foreign key to Users
- `Image URL` - Cloudinary URL
- `File Name` - Original filename
- `File Size` - File size in bytes
- `Status` - queued/processing/published/failed
- `Upload Date` - Processing timestamp
- `Publish Date` - Scheduled publish date
- `Notes` - User notes
- `Tags` - Content tags
- `Metadata` - Additional data (JSON)

## 🎨 UI/UX Features

### Interactive Elements
- **Spinning Upload Icon** - Subtle animation with outer ring
- **Horizontal Carousel** - Fixed-width container with smooth scrolling
- **Drag-and-Drop** - File upload and queue reordering
- **Hover Effects** - Scale and lift animations on cards
- **Status Indicators** - Color-coded badges for processing status

### Responsive Design
- **Mobile-first** - Optimized for all screen sizes
- **Fixed Layout** - Carousel maintains consistent width
- **Adaptive Grids** - Dynamic layouts based on screen size

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Airtable account with API access
- Cloudinary account
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/bvryn7/AirTableQueueforCustomers.git
cd AirTableQueueforCustomers
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp env.template .env.local
```

4. **Configure environment variables**
```env
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. **Run development server**
```bash
npm run dev
```

6. **Open application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 API Endpoints

### Queue Management
- `POST /api/airtable/queue/add` - Add image to queue
- `POST /api/airtable/queue/bulk-add` - Bulk upload
- `DELETE /api/airtable/queue/delete` - Remove from queue
- `PUT /api/airtable/queue/reorder` - Reorder queue items
- `GET /api/airtable/queue/status` - Get queue status

### User Management
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `GET /api/airtable/user/profile` - Get user profile
- `PUT /api/airtable/user/preferences` - Update preferences
- `POST /api/airtable/user/verify` - Email verification

### File Processing
- `POST /api/upload` - File upload handler
- `GET /api/cloudinary/ping` - Service health check

## 🔧 Configuration

### Airtable Setup
1. Create new Airtable base
2. Set up Users and Image Queue tables
3. Configure field mappings (see `airtable-fields-reference.md`)
4. Generate API key from Airtable account

### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name and API credentials
3. Configure upload presets (optional)

## 🎯 Key Features in Detail

### Auto-Processing Flow
- Images dropped → instantly added to local queue
- Process button appears above drop zone
- Auto-triggers processing after 100ms delay
- Real-time status updates during upload

### Publishing Queue Sidebar
- Shows Airtable queue items with queue numbers
- Drag-and-drop reordering capability
- Status badges and action buttons
- Real-time synchronization

### Image Bank Carousel
- Fixed-width container (1200px max)
- Smooth horizontal scrolling
- 180px image cards with hover effects
- Scroll indicators and navigation

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 🧪 Testing

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - Code linting
- `npm start` - Production server

### Test Files
- `scripts/testing/` - Test utilities
- `test-airtable-api.ps1` - PowerShell API tests
- `test-airtable-curl.sh` - Bash API tests

## 📖 Documentation

- `airtable-fields-reference.md` - Airtable schema reference
- `BACKEND_ENHANCEMENTS.md` - Backend architecture details
- `env.template` - Environment configuration template

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎨 Dynamic Theme System

### Current Themes
- **Academic** (.edu, university, college) → 🎓 Blue theme, auto-processing
- **Corporate** (.com, .org, .net) → 💼 Green theme, manual approval
- **Government** (.gov, .mil) → 🏛️ Gray theme, manual approval
- **Tech** (google, microsoft, apple, etc.) → ⚡ Purple gradient, auto-processing
- **Healthcare** (.med, hospital, health, medical) → ⚕️ Medical blue, auto-processing
- **Creative** (design, studio, agency) → 🎨 Pink/orange gradient, manual approval

### 🔧 Adding New Themes (Future Reference)

**Step 1: Define Theme in `/lib/themes.ts`**
```typescript
// Add to themes object
newTheme: {
  name: 'New Theme',
  colors: {
    primary: '#color1',      // Main brand color
    secondary: '#color2',    // Secondary brand color
    accent: '#color3',       // Accent/highlight color
    background: '#color4',   // Page background
    surface: '#color5',      // Card/surface background
    text: '#color6',         // Primary text
    textSecondary: '#color7',// Secondary text
    border: '#color8',       // Border color
    success: '#color9',      // Success state
    warning: '#color10',     // Warning state
    error: '#color11'        // Error state
  },
  logo: {
    icon: '🆕',              // Emoji or single letter
    bgColor: '#color1',      // Logo background
    textColor: '#ffffff',    // Logo text color
    shape: 'rounded',        // circle|square|rounded|hexagon
    gradient: 'linear-gradient(135deg, #color1 0%, #color3 100%)' // Optional
  },
  description: 'Theme description'
}
```

**Step 2: Add Domain Matching in `getThemeFromEmail()`**
```typescript
// Add domain detection logic
if (domain.includes('keyword') || domain.endsWith('.extension')) {
  return themes.newTheme
}
```

**Step 3: Set Auto-Processing (Optional)**
```typescript
// In shouldAutoProcess() function in upload/page.tsx
if (domain.includes('keyword')) {
  return true // or false for manual approval
}
```

**Step 4: Test**
- Use ThemeSwitcher component (🎨 button)
- Try test emails with new domain format
- Verify colors, logo, and processing behavior

## 🔄 Multi-Terminal Auto-Sync System

This project includes **automatic git hooks** for seamless collaboration between multiple terminals/Claude instances.

### 🚀 How It Works

**Git hooks automatically handle syncing** - no manual pulling/pushing needed!

```bash
# Just work normally - hooks handle everything
git add .
git commit -m "my changes"  # ← Automatically pulls latest first
git push                    # ← Automatically syncs before push
```

### 🛠️ Setup for New Terminals

If you're setting up a new terminal/Claude instance:

```bash
# 1. Clone the repo
git clone https://github.com/bvryn7/AirTableQueueforCustomers.git
cd AirTableQueueforCustomers

# 2. Install dependencies
npm install

# 3. Install auto-sync hooks
./setup-hooks.sh

# 4. Start working - hooks handle all syncing!
```

### ⚡ Active Hooks

- **pre-commit**: Auto-pulls latest changes before each commit
- **post-merge**: Auto-installs dependencies when package.json changes
- **pre-push**: Auto-syncs with remote before pushing

### 🎯 Benefits

- **Zero conflicts** - hooks prevent merge conflicts automatically
- **Always synced** - latest changes pulled before every operation
- **Background magic** - works invisibly, no user intervention needed
- **Multi-Claude ready** - perfect for collaborative development

### 📁 Hook Files

- `/.git/hooks/pre-commit` - Auto-pull before commits
- `/.git/hooks/post-merge` - Auto-install deps after pulls
- `/.git/hooks/pre-push` - Auto-sync before pushes
- `/setup-hooks.sh` - Easy setup script for new terminals
- `/AUTO_SYNC.md` - Detailed hook documentation

**Result: Multiple terminals stay perfectly synced without any manual git operations!** 🎉

## 🎉 Recent Updates

- ✅ Added dynamic email-based theme system with 6 themes
- ✅ Smart auto-processing based on email domain
- ✅ Custom logos that change per theme
- ✅ Removed manual process buttons
- ✅ Added Framer Motion animations
- ✅ Implemented horizontal image carousel
- ✅ Auto-processing on image drop
- ✅ Fixed-width carousel container
- ✅ Publishing queue sidebar with drag reordering
- ✅ Removed priority field system-wide
- ✅ Enhanced UX with spinning upload indicators

---

Built with ❤️ using Next.js, Airtable, and Framer Motion