# CrossFit App - React Native Android Application

A comprehensive CrossFit and HIIT workout application built with React Native for Android, featuring AI-powered workout generation, progress tracking, and personalized fitness plans.

## Features

### 🏋️ Workout Management
- AI-powered workout generation based on user preferences
- Customizable workout plans for different fitness levels
- Exercise library with detailed instructions
- Progress tracking and performance analytics

### 📱 Mobile-First Design
- Native Android experience with React Native
- Intuitive navigation with bottom tabs
- Responsive design for all screen sizes
- Offline capability for workout data

### 🎯 Personalization
- User profile with fitness level and body type
- Personalized workout recommendations
- Equipment-based exercise filtering
- Goal-oriented training programs

### 📊 Analytics & Tracking
- Workout history and statistics
- Progress visualization
- Achievement system
- Weekly and monthly reports

## Tech Stack

- **React Native 0.80.2** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **React Navigation 6** - Navigation and routing
- **React Native Vector Icons** - Icon library
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client for API communication

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── WorkoutContext.tsx
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── DashboardScreen.tsx
│   ├── WorkoutsScreen.tsx
│   └── ...
├── services/          # API services
│   ├── authService.ts
│   └── workoutService.ts
└── utils/             # Utility functions
```

## Key Components

### Authentication System
- Secure login and registration
- JWT token management
- Persistent authentication state
- Password reset functionality

### Workout Generation
- AI-powered workout creation
- Equipment-based filtering
- Difficulty level adjustment
- Duration customization

### Dashboard
- Workout statistics overview
- Quick action buttons
- Recent workout history
- Achievement tracking

### Workout Management
- Browse workout library
- Search and filter workouts
- Detailed workout views
- Exercise instructions

## API Integration

The app integrates with the Flask backend API for:
- User authentication and profile management
- Workout generation and storage
- Exercise template library
- Progress tracking and analytics

## Development Setup

1. **Prerequisites**
   ```bash
   # Install Node.js and npm
   # Install React Native CLI
   npm install -g react-native-cli
   
   # Install Android Studio and SDK
   # Set up Android development environment
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Android Setup**
   ```bash
   # Start Metro bundler
   npm start
   
   # Run on Android device/emulator
   npm run android
   ```

4. **Environment Configuration**
   - Update API base URL in service files
   - Configure push notification settings
   - Set up calendar integration permissions

## Build Configuration

### Debug Build
```bash
cd android
./gradlew assembleDebug
```

### Release Build
```bash
cd android
./gradlew assembleRelease
```

## Features Implementation

### Core Screens
- ✅ Splash Screen with app branding
- ✅ Login/Register with form validation
- ✅ Dashboard with statistics and quick actions
- ✅ Workouts list with search and filtering
- ✅ Workout detail view with exercise breakdown
- ✅ AI workout generation interface
- ✅ User profile management
- ✅ Settings and preferences

### Navigation
- ✅ Stack navigation for main flow
- ✅ Bottom tab navigation for main sections
- ✅ Modal screens for detailed views
- ✅ Deep linking support

### State Management
- ✅ Context API for global state
- ✅ Authentication state persistence
- ✅ Workout data caching
- ✅ Offline data handling

### UI/UX
- ✅ Material Design components
- ✅ Consistent color scheme and typography
- ✅ Loading states and error handling
- ✅ Responsive layout for different screen sizes

## Performance Optimizations

- Lazy loading of screens and components
- Image optimization and caching
- Efficient list rendering with FlatList
- Memory management for large datasets
- Background task handling

## Security Features

- Secure token storage with AsyncStorage
- API request authentication
- Input validation and sanitization
- Secure communication with HTTPS

## Future Enhancements

- Push notifications for workout reminders
- Calendar integration for scheduling
- Social features and workout sharing
- Wearable device integration
- Offline workout mode
- Video exercise demonstrations

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## Deployment

The app can be deployed to:
- Google Play Store (production)
- Internal testing tracks
- Firebase App Distribution
- Direct APK installation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

Built with ❤️ using React Native and TypeScript

