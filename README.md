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
