# 🚗 Carfolio


A modern platform for car enthusiasts to showcase, organize, and share their vehicle collection.

[![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Rodney85/Folio?utm_source=oss&utm_medium=github&utm_campaign=Rodney85%2FFolio&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)](https://coderabbit.ai/repo/Rodney85/Folio)


![Carfolio Banner](https://via.placeholder.com/800x200?text=Carfolio+Car+Showcase+Platform)

## ✨ Features

- **Car Collection Management**: Add, organize, and customize your vehicle showcase
- **Drag & Drop Interface**: Easily rearrange your cars with intuitive controls
- **Public Profiles**: Share your collection with anyone via custom URLs
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile devices
- **Social Media Integration**: Link your Instagram, TikTok, and YouTube accounts
- **QR Code Sharing**: Generate QR codes for easy sharing of your profile
- **Car Details**: Display comprehensive information about each vehicle
- **Image Gallery**: Showcase multiple images for each car

## 🛠️ Technologies

### Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Lucide Icons
- shadcn/ui Components

### Backend
- Convex (backend as a service)
- Backblaze (image/video storage)

### Authentication
- Clerk

### Payments
- Paystack

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/carfolio.git
cd carfolio

# Install dependencies
npm install

# Set up environment variables
# Copy the example .env file and fill in your credentials
cp .env.example .env

# Start the development server
npm run dev
```

## 🌐 Environment Variables

We use separate environment files for different environments:

- `.env.development` - Local development settings
- `.env.local` - Production deployment settings (used by Netlify)

### Development Environment

Create a `.env.development` file in the root directory with the following variables:

```
# Convex (local development)
VITE_CONVEX_URL=http://localhost:3000
CONVEX_DEPLOYMENT=

# Clerk (development keys)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_development_key
CLERK_SECRET_KEY=sk_test_your_development_key

# Backblaze
VITE_BACKBLAZE_KEY_ID=your_backblaze_key_id
VITE_BACKBLAZE_APP_KEY=your_backblaze_app_key
VITE_BACKBLAZE_BUCKET_ID=your_backblaze_bucket_id
VITE_BACKBLAZE_BUCKET_NAME=your_backblaze_bucket_name

# Admin
ADMIN_SECRET_TOKEN=your_admin_token

# Development Environment
NODE_ENV=development
VITE_APP_URL=http://localhost:5173

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
```

### Production Environment

The `.env.local` file contains production settings and is used by Netlify for deployment:

```
# Convex (production)
VITE_CONVEX_URL=https://your-production.convex.cloud
CONVEX_DEPLOYMENT=your_production_deployment_id

# Clerk (production keys)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key

# Backblaze (production bucket)
VITE_BACKBLAZE_KEY_ID=your_backblaze_key_id
VITE_BACKBLAZE_APP_KEY=your_backblaze_app_key
VITE_BACKBLAZE_BUCKET_ID=your_backblaze_bucket_id
VITE_BACKBLAZE_BUCKET_NAME=your_backblaze_bucket_name

# Admin
ADMIN_SECRET_TOKEN=your_admin_token

# Production Environment
VITE_APP_URL=https://yourdomain.com

# Analytics
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
```

## 📱 Mobile App

A React Native mobile app version is planned for future development, allowing users to manage their car collection on the go.

## 🔒 Security

- Authentication via Clerk ensures secure user access
- User data is protected and only public profiles are accessible to unauthenticated users

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- All car enthusiasts who inspired this project
- The open source community for providing amazing tools
