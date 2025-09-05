import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchCourseById, Course } from '../services/courseService';

export default function CourseLandingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (typeof id === 'string') {
        try {
          const fetchedCourse = await fetchCourseById(id);
          setCourse(fetchedCourse);
        } catch (error) {
          console.error('Error loading course:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCourse();
  }, [id]);

  const handleStartCourse = () => {
    if (course) {
      router.push(`/screens/video-player/${course.id}`);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Course Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The course you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Course Header */}
        <View style={styles.header}>
          <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{course.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(course.difficulty) }]}>
              <Text style={styles.difficultyText}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{course.description}</Text>

          {/* Course Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" />
              <Text style={styles.statLabel}>Instructor</Text>
              <Text style={styles.statValue}>{course.instructor}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{formatDuration(course.totalDuration)}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="play-circle-outline" size={20} color="#8E8E93" />
              <Text style={styles.statLabel}>Videos</Text>
              <Text style={styles.statValue}>{course.videos.length}</Text>
            </View>
          </View>

          {/* Course Category */}
          <View style={styles.categoryContainer}>
            <Ionicons name="bookmark-outline" size={20} color="#007AFF" />
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>

          {/* Video List Preview */}
          <View style={styles.videoListSection}>
            <Text style={styles.sectionTitle}>Course Content</Text>
            {course.videos.slice(0, 3).map((video, index) => (
              <View key={video.id} style={styles.videoItem}>
                <View style={styles.videoNumber}>
                  <Text style={styles.videoNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  <Text style={styles.videoDuration}>
                    {formatDuration(video.duration)}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={24} color="#8E8E93" />
              </View>
            ))}
            {course.videos.length > 3 && (
              <Text style={styles.moreVideosText}>
                +{course.videos.length - 3} more videos
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Start Course Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartCourse}>
          <Ionicons name="play" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Course</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  videoListSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  videoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  videoDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  moreVideosText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
