# HypeCat AI - Social Media Content Creation Platform

## Overview

HypeCat AI is an intelligent content creation platform that helps you generate, manage, and publish engaging social media content across multiple platforms including Instagram, Facebook, and X (Twitter).

## Features

### ✨ AI-Powered Content Generation
- Generate trendy titles and promotional content using advanced AI models
- Support for multiple LLM models (Auto, DeepSeek, GPT-4, Claude, etc.)
- Image analysis integration for visual product understanding
- Purpose-driven content creation (e-commerce, promotion, etc.)

### 📱 Multi-Platform Publishing
- **Direct Publishing** to Instagram, Facebook, and X
- OAuth authorization flow for secure account connection
- Platform-specific content optimization
- Demo mode for testing without API credentials

### 🎨 Content Management
- Hot keywords integration for trending content
- Content refresh for regenerating platform-specific posts
- Content calendar for scheduling and organizing posts
- Real-time preview of generated content

### 🖼️ Image Upload Support
- Upload up to 5 product images
- Automatic image analysis and integration with AI
- Visual preview with easy management
- 5MB per image limit with format validation

### 🌐 Internationalization
- Full support for English, Chinese (中文), and German (Deutsch)
- Seamless language switching
- Localized content generation

### 🎯 User Experience
- Interactive onboarding tour for first-time users
- Dark/Light mode toggle
- Collapsible sidebar navigation
- User feedback system
- Responsive design

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hyperCat.git
cd hyperCat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (optional OAuth credentials).

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Social Media Publishing Setup

### Demo Mode (No Setup Required)
The application runs in demo mode by default, allowing you to:
- Test the complete authorization flow
- Simulate publishing to social platforms
- Develop and test without API credentials

### Production Setup

For real social media publishing, configure OAuth credentials:

#### Instagram
1. Create a Facebook App at https://developers.facebook.com
2. Add Instagram API product
3. Set environment variables in `.env.local`:
```env
INSTAGRAM_CLIENT_ID=your_client_id
INSTAGRAM_CLIENT_SECRET=your_client_secret
```

#### Facebook
1. Create a Facebook App
2. Add Facebook Login product
3. Set environment variables:
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

#### X (Twitter)
1. Create an App at https://developer.twitter.com
2. Enable OAuth 2.0
3. Set environment variables:
```env
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
```

See [SOCIAL_MEDIA_PUBLISHING.md](./SOCIAL_MEDIA_PUBLISHING.md) for detailed setup instructions.

## Usage

### 1. Content Creation
1. Select your preferred AI model
2. Enter product information and upload images (optional)
3. Choose content purpose (e.g., e-commerce promotion)
4. Add hot keywords for trending content
5. Click "Generate" to create content

### 2. Platform-Specific Content
1. Select a generated title
2. Choose a social media platform (Instagram/Facebook/X)
3. Review the platform-optimized content
4. Use the refresh button to regenerate if needed

### 3. Publishing
1. Click "Publish to {Platform}" button
2. If first time: Authorize your social media account
3. Content is published and saved to calendar
4. View scheduled content in Content Calendar

## Project Structure

```
hyperCat/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate/     # Content generation
│   │   │   ├── social-auth/  # OAuth authentication
│   │   │   └── social-publish/ # Publishing endpoint
│   │   ├── content-creation/ # Main content creation page
│   │   ├── content-calender/ # Calendar view
│   │   └── ...
│   ├── components/
│   │   ├── MainLayout.tsx         # Main layout with navigation
│   │   ├── SocialMediaPublisher.tsx # Publishing component
│   │   ├── OnboardingTour.tsx     # User onboarding
│   │   └── ...
│   └── lib/
│       ├── openai.ts         # AI integration
│       └── supabase.ts       # Database (if used)
├── public/
│   └── locales/              # Translation files (en, zh, de)
└── docs/
    ├── API_IMAGE_SUPPORT.md
    └── SOCIAL_MEDIA_PUBLISHING.md
```

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: react-i18next
- **AI Integration**: OpenAI API, DeepSeek API
- **Date Handling**: date-fns, react-datepicker
- **Authentication**: OAuth 2.0

## Configuration

### API Timeout
All API requests have a 15-second timeout to prevent hanging requests.

### Image Upload Limits
- Maximum 5 images
- 5MB per image
- Supported formats: JPEG, PNG, GIF, WebP

### Content Length
- Generated promotional content: 100-150 characters/words
- Platform-optimized for each social media

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or feedback:
- Use the in-app Feedback button
- Open an issue on GitHub
- Contact support@hypecatai.com

## Roadmap

- [ ] Multi-account support per platform
- [ ] Advanced scheduling and queue management
- [ ] Post analytics and engagement tracking
- [ ] Bulk publishing to multiple platforms
- [ ] Content templates and saved drafts
- [ ] Video content support
- [ ] More AI model options

---

Made with ❤️ by the HypeCat AI Team
