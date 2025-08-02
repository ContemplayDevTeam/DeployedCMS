# AirTable Queue for Customers

A professional image upload and queue management system with Airtable backend integration.

## Features

- **Professional Landing Page** - Clean, modern design with "Upload, Queue, and Create" messaging
- **Advanced Upload System** - Drag-and-drop file upload with size validation
- **Queue Management** - Numbered queue with image thumbnails and drag-and-drop reordering
- **Multi-Select Operations** - Bulk delete and manage queue items
- **Airtable Backend** - Complete backend powered by Airtable for data storage
- **User Authentication** - Email-based user management with verification
- **Responsive Design** - Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Google Fonts (Inter + Poppins)
- **Backend**: Airtable API
- **File Upload**: react-dropzone
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Airtable account with API access
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bvryn7/AirTableQueueforCustomers.git
cd AirTableQueueforCustomers
```

2. Install dependencies:
```bash
npm install
```

3. Set up Airtable:
   - Follow the setup instructions in `scripts/setup-airtable.md`
   - Create your Airtable base and tables
   - Configure your environment variables

4. Create `.env.local` file:
```env
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## Airtable Integration

This application uses Airtable as its backend database. The integration includes:

- **User Management** - Store user information and verification status
- **Queue Management** - Track image uploads with status and priority
- **Real-time Updates** - Queue status updates automatically
- **Scalable Architecture** - Easy to extend with additional features

### Required Airtable Tables

1. **Users Table** - User authentication and verification
2. **Image Queue Table** - Image upload queue management

See `scripts/setup-airtable.md` for detailed setup instructions.

## Usage

1. **Landing Page** - Users can sign up or log in with their email
2. **Upload Page** - Drag and drop images to automatically queue them
3. **Queue Management** - View, reorder, and manage queued images
4. **Airtable Integration** - All data is stored and managed in Airtable

## Deployment

This application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
