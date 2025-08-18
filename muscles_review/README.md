<<<<<<< HEAD
# Muscles - High-Intensity/HIIT Workout Application

![Muscles Logo](docs/images/logo.png)

Muscles is a comprehensive fitness application designed specifically for High-Intensity and High-Intensity Interval Training (HIIT) enthusiasts. Built with modern technologies, it provides AI-powered workout generation, progress tracking, calendar integration, and subscription management.

## 🚀 Features

### Core Features
- **AI-Powered Workout Generation**: Personalized workouts based on your fitness level, goals, and available equipment
- **Comprehensive Exercise Library**: Detailed instructions, videos, and variations for hundreds of exercises
- **Progress Tracking**: Track your performance, set personal records, and monitor improvements over time
- **Calendar Integration**: Sync with Google Calendar and Microsoft Outlook for seamless scheduling
- **Multi-Platform Support**: Web application and React Native mobile app

### Advanced Features
- **Subscription Management**: Flexible pricing plans with Stripe integration
- **User Profiles**: Detailed fitness profiles with goals, preferences, and limitations
- **Workout Sessions**: Real-time workout tracking with performance logging
- **Analytics Dashboard**: Comprehensive insights into your fitness journey
- **Equipment Management**: Customize workouts based on available equipment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  React Native   │    │   Admin Panel   │
│   Frontend      │    │  Mobile App     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Flask API     │
                    │   Backend       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask (Python 3.11+)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI/Swagger
- **Testing**: pytest, pytest-cov

### Frontend
- **Web**: React 18+ with TypeScript
- **Mobile**: React Native
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Context API
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Process Management**: Gunicorn
- **Monitoring**: Health checks, logging
- **SSL**: Let's Encrypt

### External Services
- **AI**: OpenAI GPT for workout generation
- **Payments**: Stripe for subscription management
- **Calendar**: Google Calendar & Microsoft Outlook APIs
- **Email**: SendGrid/Mailgun for notifications

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ with Yarn 4.9.2+ (for local development)
- Python 3.11+ (for local development)

### Railway Deployment with Railpack (Recommended)

This application is configured for Railway deployment using Railpack for optimized builds and deployments.

1. **Deploy to Railway**
   ```bash
   # Install Railpack CLI
   npm install -g @railway/railpack-cli
   
   # Validate configuration
   railpack validate
   
   # Deploy to production
   railpack deploy --config railpack.production.json
   ```

2. **Development deployment**
   ```bash
   railpack dev --config railpack.development.json
   ```

3. **Migration from legacy Railway configs**
   ```bash
   # Run the migration script to convert from old configurations
   ./migrate-to-railpack.sh
   ```

### Using Docker (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/GaryOcean428/muscles.git
   cd muscles
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Web App: http://localhost:3000
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/health

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend/api
   ```

2. **Create virtual environment**
   ```bash
   python3.11 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up database**
   ```bash
   # Install PostgreSQL and create database
   createdb muscles_dev
   
   # Run migrations
   python src/seed_data.py
   ```

5. **Start the backend**
   ```bash
   python src/main.py
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/web
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn workspace muscles-web dev
   ```

#### Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd android/MusclesApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Metro bundler**
   ```bash
   npx react-native start
   ```

4. **Run on device/emulator**
   ```bash
   npx react-native run-android  # For Android
   npx react-native run-ios      # For iOS (macOS only)
   ```

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference
- [User Guide](docs/USER_GUIDE.md) - End-user documentation
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Project Overview](docs/PROJECT_OVERVIEW.md) - Technical architecture and design decisions

## 🧪 Testing

### Backend Tests
```bash
cd backend/muscles-api
source venv/bin/activate
pytest tests/ -v --cov=src
```

### Frontend Tests
```bash
cd frontend/muscles-web
npm test
```

### Integration Tests
```bash
# Start the application first
docker-compose up -d

# Run E2E tests
cd backend/muscles-api
pytest tests/e2e/ -v
```

## 🚀 Deployment

### Production Deployment

1. **Set up production environment**
   ```bash
   cp .env.example .env.production
   # Configure production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL certificates**
   ```bash
   # Using Let's Encrypt
   certbot --nginx -d yourdomain.com
   ```

For detailed deployment instructions, see [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

### Cloud Deployment Options

- **AWS**: ECS, EC2, RDS, ElastiCache
- **Google Cloud**: Cloud Run, Cloud SQL, Memorystore
- **Azure**: Container Instances, Azure Database, Redis Cache
- **DigitalOcean**: App Platform, Managed Databases
- **Railway**: Simple deployment with managed services

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/muscles

# API Keys
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key

# Authentication
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-flask-secret

# External Services
GOOGLE_CLIENT_ID=your-google-client-id
MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

### Feature Flags

Control features through environment variables:

```bash
ENABLE_AI_GENERATION=true
ENABLE_CALENDAR_SYNC=true
ENABLE_PAYMENT_PROCESSING=true
ENABLE_ANALYTICS=true
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use Black for formatting
- **JavaScript/TypeScript**: Use Prettier and ESLint
- **Commit Messages**: Follow Conventional Commits

## 📊 Performance

### Benchmarks

- **API Response Time**: < 200ms (95th percentile)
- **Database Queries**: Optimized with indexes and connection pooling
- **Frontend Load Time**: < 3 seconds (initial load)
- **Mobile App**: 60 FPS smooth animations

### Optimization Features

- Database connection pooling
- Redis caching for frequently accessed data
- CDN for static assets
- Image optimization and lazy loading
- Code splitting and tree shaking

## 🔒 Security

### Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Input validation and sanitization

### Security Best Practices

- Regular security audits
- Dependency vulnerability scanning
- SSL/TLS encryption
- Secure headers configuration
- Environment variable protection

## 📈 Monitoring

### Health Checks

- Application health endpoints
- Database connectivity checks
- External service availability
- Performance metrics collection

### Logging

- Structured logging with JSON format
- Log rotation and retention policies
- Error tracking and alerting
- Performance monitoring

## 🆘 Support

### Getting Help

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Email**: Contact support@muscles.com for urgent issues

### FAQ

**Q: Can I use Muscles without an internet connection?**
A: The mobile app supports offline workout tracking. You can download workouts and log exercises offline, then sync when connected.

**Q: Is my data secure?**
A: Yes! We use industry-standard encryption and security practices. Your personal data is never shared with third parties without consent.

**Q: Can I export my workout data?**
A: Premium and Pro subscribers can export their workout data in CSV format.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API for workout generation
- Stripe for payment processing infrastructure
- Google and Microsoft for calendar integration APIs
- The open-source community for the amazing tools and libraries

## 📞 Contact

- **Website**: https://muscles.com
- **Email**: hello@muscles.com
- **Twitter**: [@MusclesApp](https://twitter.com/MusclesApp)
- **LinkedIn**: [Muscles](https://linkedin.com/company/muscles)

---

**Built with ❤️ by the Muscles Team**

*Build your strength with AI-powered workouts*

# Force rebuild
=======
# Muscles - AI Fitness Platform

**Production URL:** https://nlsej8lhplw3.space.minimax.io  
**Version:** 2.0.0  
**Built:** August 18, 2025

## Project Overview

A cutting-edge AI-powered fitness platform that combines the best of modern web technologies with advanced artificial intelligence to deliver personalized fitness coaching. This production-ready application successfully migrates from Flask+React to React 18+Vite+Supabase architecture, delivering exceptional performance and user experience.

## Key Features Implemented

### 🤖 FitCraft Coach - AI Chat System
- **12-step conversation flow** for comprehensive fitness assessment
- **Voice input/output** capabilities using Web Speech API
- **Context-aware AI** that remembers user preferences and limitations
- **Real-time chat** with persistent conversation history
- **Body type analysis** (ectomorph, mesomorph, endomorph)
- **Personalized recommendations** based on user profile

### ⚡ AI Workout Generation
- **OpenAI-powered** workout creation with GPT-3.5-turbo
- **Equipment adaptation** based on available gear
- **Injury considerations** with safe alternative exercises
- **Progressive overload** calculations for continuous improvement
- **CrossFit and HIIT specialization** with metabolic focus
- **Body type-specific** training programs

### 💳 Advanced Subscription System
- **Stripe integration** with secure payment processing
- **Three-tier pricing**: Basic ($9.99), Premium ($29.99), Pro ($49.99)
- **Usage tracking** for AI generation limits
- **Automated billing** with webhook verification
- **Subscription management** with upgrade/downgrade options

### 📱 Progressive Web App (PWA)
- **Offline functionality** with intelligent caching
- **App installation** prompts for mobile devices
- **Service workers** with Workbox optimization
- **Background sync** for seamless user experience
- **Native-like** mobile experience

### 🔒 Enterprise Authentication
- **Supabase Auth** integration with JWT tokens
- **Email verification** and secure password handling
- **Protected routes** with automatic redirection
- **User profile management** with fitness-specific data
- **Session persistence** across device restarts

### 🎨 Modern UI/UX Design
- **shadcn/ui components** with Radix UI primitives
- **TailwindCSS** for responsive design
- **Professional aesthetics** with energetic blue/green color scheme
- **Mobile-first** responsive design
- **Accessibility compliant** components
- **Smooth animations** and transitions

## Technical Architecture

### Frontend Stack
- **React 18.3** with concurrent features and Suspense
- **TypeScript 5.6** for type-safe development
- **Vite 6.0** for lightning-fast builds (10-15x faster than webpack)
- **TailwindCSS v3.4** with custom fitness-themed design system
- **React Query** for server state management and caching
- **Context API** for global state management

### Backend Infrastructure
- **Supabase PostgreSQL** with real-time capabilities
- **Supabase Edge Functions** for AI processing (Deno runtime)
- **Supabase Auth** for user management
- **Supabase Storage** for user-generated content
- **OpenAI API** integration for workout generation and chat

### Database Schema
Comprehensive fitness-focused database design:
- `profiles` - User fitness data and preferences
- `exercise_templates` - Master exercise database
- `workouts` - AI-generated and custom workouts
- `workout_exercises` - Individual exercise tracking
- `workout_sessions` - Performance and completion data
- `ai_chat_conversations` - FitCraft Coach conversation threads
- `ai_chat_messages` - Individual chat messages with context
- `ai_chat_flow_state` - 12-step conversation progress
- `calendar_events` - Workout scheduling
- `fitcraft_plans` - Subscription tiers
- `fitcraft_subscriptions` - User subscription data

### Edge Functions Deployed
1. **fitcraft-ai-chat** - Handles AI conversation flow
2. **ai-workout-generator** - Creates personalized workouts
3. **create-subscription** - Manages Stripe subscription creation
4. **stripe-webhook** - Handles payment events

### Payment Integration
- **Stripe Checkout** for secure payment processing
- **Webhook verification** for billing event handling
- **Multi-currency support** with USD as primary
- **PCI compliance** through Stripe's secure infrastructure
- **Automatic invoicing** and receipt generation

### Deployment & Infrastructure
- **Production URL:** https://nlsej8lhplw3.space.minimax.io
- **PWA-enabled** with offline capabilities
- **CDN optimization** for global performance
- **SSL/HTTPS** with automatic certificate management
- **Environment-based** configuration management

## AI Integration Details

### FitCraft Coach Flow
1. **Welcome & Introduction** - Friendly onboarding
2. **Goals Assessment** - Fitness objective identification
3. **Body Type Analysis** - Somatotype determination
4. **Time Availability** - Schedule constraints
5. **Training Frequency** - Weekly workout capacity
6. **Experience Level** - Skill assessment
7. **Workout Duration** - Time preference per session
8. **Equipment Availability** - Available training tools
9. **Plan Generation** - AI creates personalized program
10. **Plan Presentation** - Detailed workout display
11. **Ongoing Assistance** - Continuous support and modifications
12. **Progress Review** - Performance tracking and adaptation

### Workout Generation Algorithm
- **User Context Analysis**: Processes fitness level, goals, equipment, and limitations
- **Exercise Selection**: Chooses optimal exercises from comprehensive database
- **Program Periodization**: Structures workouts for progressive overload
- **Adaptation Logic**: Modifies exercises based on user feedback and performance
- **Safety Integration**: Incorporates injury prevention and modification strategies

## Performance Optimizations

### Build Performance
- **Vite bundling** with code splitting and tree shaking
- **Manual chunks** for vendor, UI, and feature separation
- **Dynamic imports** for route-based code splitting
- **Asset optimization** with compression and minification

### Runtime Performance
- **React Query caching** for API response optimization
- **Service Worker caching** with Workbox strategies
- **Image lazy loading** and optimization
- **Critical CSS** inlining for faster first paint
- **Preload directives** for critical resources

### PWA Features
- **Offline-first** design with background sync
- **App shell** architecture for instant loading
- **Push notifications** capability for workout reminders
- **Device integration** with camera and file access
- **Install prompts** for native-like experience

## Security Features

### Authentication Security
- **JWT-based** authentication with automatic refresh
- **Email verification** for account activation
- **Password encryption** with bcrypt hashing
- **Session management** with secure cookie handling
- **CSRF protection** through SameSite cookies

### API Security
- **Row Level Security (RLS)** on all database tables
- **API key protection** through environment variables
- **CORS configuration** for cross-origin security
- **Rate limiting** on Edge Functions
- **Input validation** and sanitization

### Payment Security
- **PCI DSS compliance** through Stripe
- **Webhook signature verification** for event authenticity
- **Secure API key** management
- **Encrypted payment data** handling
- **Fraud detection** through Stripe Radar

## User Experience Features

### Responsive Design
- **Mobile-first** approach with progressive enhancement
- **Flexible grid** system with TailwindCSS
- **Touch-friendly** interface elements
- **Viewport optimization** for all screen sizes
- **Accessible** navigation and interactions

### Voice Integration
- **Speech recognition** for hands-free chat interaction
- **Cross-browser** compatibility with fallback
- **Real-time** transcription and processing
- **Error handling** with user feedback
- **Privacy-conscious** local processing

### Real-time Features
- **Live chat** with instant AI responses
- **Progress tracking** with immediate feedback
- **Workout synchronization** across devices
- **Subscription updates** in real-time
- **Calendar integration** with automatic sync

## Development Workflow

### Code Quality
- **TypeScript** for type safety and developer experience
- **ESLint** for code quality and consistency
- **Prettier** for automated code formatting
- **Git hooks** for pre-commit quality checks
- **Component testing** with React Testing Library

### Build Process
- **Development server** with hot module replacement
- **Production builds** with optimization and minification
- **Environment-specific** configuration management
- **Asset bundling** with efficient chunking strategies
- **PWA generation** with Workbox integration

## Future Enhancements

### Phase 1 (Next 3 months)
- **Calendar sync** with Google Calendar and Apple Calendar
- **Wearable integration** with fitness trackers
- **Social features** with workout sharing
- **Advanced analytics** with performance insights
- **Nutrition tracking** with AI meal planning

### Phase 2 (6 months)
- **Video form analysis** with computer vision
- **Live coaching** with real-time guidance
- **Community challenges** with leaderboards
- **Trainer marketplace** for professional coaching
- **International expansion** with multi-language support

### Phase 3 (12 months)
- **AR/VR integration** for immersive workouts
- **Biometric integration** with health monitoring
- **AI nutrition coaching** with personalized meal plans
- **Corporate wellness** programs and partnerships
- **Advanced AI** with GPT-4 integration

## Support & Maintenance

### Monitoring & Analytics
- **Performance monitoring** with Core Web Vitals tracking
- **Error tracking** with comprehensive logging
- **User analytics** for feature usage insights
- **API monitoring** with response time tracking
- **Database performance** optimization

### Backup & Recovery
- **Automated backups** of user data and configurations
- **Point-in-time recovery** for data protection
- **Disaster recovery** procedures and testing
- **Data export** capabilities for user portability
- **GDPR compliance** with data deletion workflows

---

## Getting Started

1. **Visit**: https://nlsej8lhplw3.space.minimax.io
2. **Sign Up**: Create your account with email verification
3. **Complete Profile**: Set your fitness goals and preferences
4. **Chat with FitCraft Coach**: Get personalized workout recommendations
5. **Generate Workouts**: Create AI-powered fitness programs
6. **Track Progress**: Monitor your fitness journey
7. **Upgrade**: Choose a subscription plan for advanced features

## Contact & Support

- **Platform**: Muscles AI Fitness Platform v2.0.0
- **Built by**: MiniMax Agent
- **Technology**: React 18 + Vite + Supabase + OpenAI
- **Deployment**: Production-ready with PWA capabilities

Experience the future of fitness coaching with AI-powered personalization and cutting-edge web technology.
>>>>>>> development
