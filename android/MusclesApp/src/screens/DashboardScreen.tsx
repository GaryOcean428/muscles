import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {useWorkout} from '../contexts/WorkoutContext';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const DashboardScreen = () => {
  const {user} = useAuth();
  const {workouts, loading, fetchWorkouts} = useWorkout();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisWeekWorkouts: 0,
    totalMinutes: 0,
    averageDuration: 0,
    favoriteType: 'HIIT',
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      calculateStats();
    }
  }, [workouts]);

  const calculateStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekWorkouts = workouts.filter(
      workout => new Date(workout.created_at) >= weekAgo,
    ).length;

    const totalMinutes = workouts.reduce(
      (sum, workout) => sum + (workout.duration_minutes || 0),
      0,
    );

    const averageDuration =
      workouts.length > 0 ? Math.round(totalMinutes / workouts.length) : 0;

    // Find most common workout type
    const typeCounts = workouts.reduce((acc: any, workout) => {
      acc[workout.workout_type] = (acc[workout.workout_type] || 0) + 1;
      return acc;
    }, {});

    const favoriteType =
      Object.keys(typeCounts).reduce((a, b) =>
        typeCounts[a] > typeCounts[b] ? a : b,
      ) || 'HIIT';

    setStats({
      totalWorkouts: workouts.length,
      thisWeekWorkouts,
      totalMinutes,
      averageDuration,
      favoriteType: favoriteType?.toUpperCase() || 'HIIT',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const quickActions = [
    {
      title: 'Generate Workout',
      description: 'Create a new AI-powered workout',
      icon: 'auto-awesome',
      color: '#f59e0b',
      onPress: () => navigation.navigate('Generate' as never),
    },
    {
      title: 'Browse Workouts',
      description: 'View all your workouts',
      icon: 'fitness-center',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Workouts' as never),
    },
    {
      title: 'View Profile',
      description: 'Update your fitness profile',
      icon: 'person',
      color: '#10b981',
      onPress: () => navigation.navigate('Profile' as never),
    },
  ];

  const recentWorkouts = workouts.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user?.first_name}! 👋</Text>
        <Text style={styles.subtitle}>
          Here's your fitness overview and recent activity.
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="fitness-center" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
          <Text style={styles.statSubtext}>{stats.thisWeekWorkouts} this week</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="schedule" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{formatDuration(stats.totalMinutes)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
          <Text style={styles.statSubtext}>
            Avg: {formatDuration(stats.averageDuration)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="trending-up" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{stats.favoriteType}</Text>
          <Text style={styles.statLabel}>Favorite Type</Text>
          <Text style={styles.statSubtext}>Most performed</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="track-changes" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{stats.thisWeekWorkouts}/5</Text>
          <Text style={styles.statLabel}>Weekly Goal</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {width: `${(stats.thisWeekWorkouts / 5) * 100}%`},
              ]}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}>
              <View style={[styles.actionIcon, {backgroundColor: action.color}]}>
                <Icon name={action.icon} size={24} color="white" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts' as never)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : recentWorkouts.length > 0 ? (
          <View style={styles.workoutsList}>
            {recentWorkouts.map(workout => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() =>
                  navigation.navigate('WorkoutDetail' as never, {
                    workoutId: workout.id,
                  } as never)
                }>
                <View style={styles.workoutIcon}>
                  <Icon name="fitness-center" size={20} color="#6366f1" />
                </View>
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDetails}>
                    {new Date(workout.created_at).toLocaleDateString()} •{' '}
                    {formatDuration(workout.duration_minutes)}
                  </Text>
                </View>
                <View style={styles.workoutBadges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {workout.workout_type?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyDescription}>
              Generate your first AI-powered workout to get started!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Generate' as never)}>
              <Icon name="add" size={20} color="white" />
              <Text style={styles.emptyButtonText}>Generate Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>🔥</Text>
            <Text style={styles.achievementTitle}>Consistency</Text>
            <Text style={styles.achievementDescription}>
              {stats.thisWeekWorkouts} workouts this week
            </Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>💪</Text>
            <Text style={styles.achievementTitle}>Dedication</Text>
            <Text style={styles.achievementDescription}>
              {stats.totalWorkouts} total workouts
            </Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>⏱️</Text>
            <Text style={styles.achievementTitle}>Time Invested</Text>
            <Text style={styles.achievementDescription}>
              {formatDuration(stats.totalMinutes)} total
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  viewAllText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  workoutsList: {
    gap: 12,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  workoutBadges: {
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  achievementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default DashboardScreen;

