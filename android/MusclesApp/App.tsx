import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Context Providers
import {AuthProvider} from './src/contexts/AuthContext';
import {WorkoutProvider} from './src/contexts/WorkoutContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import GenerateWorkoutScreen from './src/screens/GenerateWorkoutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Workouts':
              iconName = 'fitness-center';
              break;
            case 'Generate':
              iconName = 'auto-awesome';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Generate" component={GenerateWorkoutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkoutProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="WorkoutDetail" 
                component={WorkoutDetailScreen}
                options={{
                  headerShown: true,
                  title: 'Workout Details',
                  headerStyle: {
                    backgroundColor: '#6366f1',
                  },
                  headerTintColor: '#fff',
                }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                  headerShown: true,
                  title: 'Settings',
                  headerStyle: {
                    backgroundColor: '#6366f1',
                  },
                  headerTintColor: '#fff',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </WorkoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;

