# 🚗 Carfolio

A modern platform for car enthusiasts to showcase, organize, and share their vehicle collection.

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

Create a `.env` file in the root directory with the following variables:

```
# Convex
CONVEX_DEPLOYMENT=your_convex_deployment_id

# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Backblaze
BACKBLAZE_BUCKET_ID=your_backblaze_bucket_id
BACKBLAZE_APP_KEY=your_backblaze_app_key

# Paystack (if implemented)
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
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
