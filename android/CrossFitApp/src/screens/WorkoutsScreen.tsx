import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import {useWorkout} from '../contexts/WorkoutContext';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WorkoutsScreen = () => {
  const {workouts, loading, fetchWorkouts} = useWorkout();
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    let filtered = workouts;

    if (searchTerm) {
      filtered = filtered.filter(
        workout =>
          workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(workout => workout.workout_type === filterType);
    }

    setFilteredWorkouts(filtered);
  }, [workouts, searchTerm, filterType]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'hiit':
        return '#f97316';
      case 'crossfit':
        return '#8b5cf6';
      case 'strength':
        return '#3b82f6';
      case 'cardio':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderWorkoutCard = ({item: workout}: {item: any}) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() =>
        navigation.navigate('WorkoutDetail' as never, {
          workoutId: workout.id,
        } as never)
      }>
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {backgroundColor: getWorkoutTypeColor(workout.workout_type)},
            ]}>
            <Text style={styles.badgeText}>
              {workout.workout_type?.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              styles.outlineBadge,
              {borderColor: getDifficultyColor(workout.difficulty_level)},
            ]}>
            <Text
              style={[
                styles.badgeText,
                {color: getDifficultyColor(workout.difficulty_level)},
              ]}>
              {workout.difficulty_level}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.workoutDescription} numberOfLines={2}>
        {workout.description}
      </Text>

      <View style={styles.workoutDetails}>
        <View style={styles.detailItem}>
          <Icon name="schedule" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {formatDuration(workout.duration_minutes)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="event" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{formatDate(workout.created_at)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="fitness-center" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {workout.exercises?.length || 0} exercises
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filterTypes = [
    {label: 'All Types', value: 'all'},
    {label: 'HIIT', value: 'hiit'},
    {label: 'CrossFit', value: 'crossfit'},
    {label: 'Strength', value: 'strength'},
    {label: 'Cardio', value: 'cardio'},
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <Text style={styles.subtitle}>Manage and track your workout collection</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => navigation.navigate('Generate' as never)}>
          <Icon name="add" size={20} color="white" />
          <Text style={styles.generateButtonText}>Generate Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}>
        {filterTypes.map(filter => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              filterType === filter.value && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType(filter.value)}>
            <Text
              style={[
                styles.filterChipText,
                filterType === filter.value && styles.activeFilterChipText,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workouts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workouts...</Text>
        </View>
      ) : filteredWorkouts.length > 0 ? (
        <FlatList
          data={filteredWorkouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.workoutsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="fitness-center" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {searchTerm || filterType !== 'all'
              ? 'No workouts found'
              : 'No workouts yet'}
          </Text>
          <Text style={styles.emptyDescription}>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Generate your first AI-powered workout to get started!'}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  filterContainer: {
    paddingLeft: 24,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterChip: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  workoutsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outlineBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
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
});

export default WorkoutsScreen;

