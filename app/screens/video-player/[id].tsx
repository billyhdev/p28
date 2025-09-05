import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../../../components/VideoPlayer';
import PlaylistDrawer from '../../../components/PlaylistDrawer';
import { 
  fetchCourseById, 
  getUserProgress, 
  updateUserProgress, 
  markVideoCompleted,
  fetchQuizByCourseId,
  Course,
  Video,
  UserProgress
} from '../../../services/courseService';
import { useUserStore } from '../../../stores/userStore';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentVideo = course?.videos[currentVideoIndex];

  useEffect(() => {
    const loadCourseAndProgress = async () => {
      if (typeof id === 'string' && user) {
        try {
          setLoading(true);
          
          // Load course
          const fetchedCourse = await fetchCourseById(id);
          setCourse(fetchedCourse);
          
          if (fetchedCourse) {
            // Load user progress
            const progress = await getUserProgress(user.uid, id);
            setUserProgress(progress);
            
            // Set current video based on progress or start from beginning
            if (progress?.currentVideoId) {
              const videoIndex = fetchedCourse.videos.findIndex(v => v.id === progress.currentVideoId);
              if (videoIndex !== -1) {
                setCurrentVideoIndex(videoIndex);
              }
            }
          }
        } catch (error) {
          console.error('Error loading course and progress:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCourseAndProgress();
  }, [id, user]);

  const handleVideoEnd = async () => {
    if (!course || !user) return;

    const currentVideoId = course.videos[currentVideoIndex].id;
    
    // Mark current video as completed
    await markVideoCompleted(user.uid, course.id, currentVideoId);
    
    // Update local progress
    const updatedCompletedVideos = [...(userProgress?.completedVideos || []), currentVideoId];
    setUserProgress(prev => prev ? { ...prev, completedVideos: updatedCompletedVideos } : null);

    // Check if all videos are completed
    if (currentVideoIndex === course.videos.length - 1) {
      // All videos completed, show quiz
      const quiz = await fetchQuizByCourseId(course.id);
      if (quiz) {
        router.push(`/screens/quiz/${course.id}`);
      } else {
        Alert.alert(
          'Course Completed!',
          'Congratulations! You have completed all videos in this course.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } else {
      // Move to next video
      setCurrentVideoIndex(currentVideoIndex + 1);
      
      // Update progress
      const nextVideoId = course.videos[currentVideoIndex + 1].id;
      await updateUserProgress(user.uid, course.id, {
        currentVideoId: nextVideoId,
        completedVideos: updatedCompletedVideos,
      });
    }
  };

  const handleVideoSelect = async (video: Video) => {
    if (!course || !user) return;

    const videoIndex = course.videos.findIndex(v => v.id === video.id);
    if (videoIndex !== -1) {
      setCurrentVideoIndex(videoIndex);
      setShowPlaylist(false);
      
      // Update progress
      await updateUserProgress(user.uid, course.id, {
        currentVideoId: video.id,
      });
    }
  };

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading course...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course || !currentVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course or video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.videoTitle} numberOfLines={1}>
            {currentVideo.title}
          </Text>
        </View>
        
        <TouchableOpacity onPress={togglePlaylist} style={styles.playlistButton}>
          <Ionicons name="list" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <VideoPlayer 
          video={currentVideo}
          onVideoEnd={handleVideoEnd}
          fullWidth={true}
        />
      </View>

      {/* Video Info */}
      <ScrollView style={styles.content}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{currentVideo.title}</Text>
          <Text style={styles.videoDescription}>{currentVideo.description}</Text>
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Video {currentVideoIndex + 1} of {course.videos.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentVideoIndex + 1) / course.videos.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentVideoIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={() => {
              if (currentVideoIndex > 0) {
                setCurrentVideoIndex(currentVideoIndex - 1);
              }
            }}
            disabled={currentVideoIndex === 0}
          >
            <Ionicons name="play-back" size={20} color="#007AFF" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentVideoIndex === course.videos.length - 1 && styles.navButtonQuiz
            ]}
            onPress={() => {
              if (currentVideoIndex === course.videos.length - 1) {
                // Last video - navigate to quiz
                router.push(`/screens/quiz/${course.id}`);
              } else {
                // Not last video - go to next video
                setCurrentVideoIndex(currentVideoIndex + 1);
              }
            }}
          >
            <Text style={[
              styles.navButtonText,
              currentVideoIndex === course.videos.length - 1 && styles.navButtonTextQuiz
            ]}>
              {currentVideoIndex === course.videos.length - 1 ? 'Take Quiz' : 'Next'}
            </Text>
            <Ionicons 
              name={currentVideoIndex === course.videos.length - 1 ? 'help-circle' : 'play-forward'} 
              size={20} 
              color={currentVideoIndex === course.videos.length - 1 ? '#4CAF50' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Playlist Drawer */}
      <PlaylistDrawer
        videos={course.videos}
        currentVideoId={currentVideo.id}
        completedVideos={userProgress?.completedVideos || []}
        onVideoSelect={handleVideoSelect}
        onClose={() => setShowPlaylist(false)}
        visible={showPlaylist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Add extra padding for status bar
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Add padding for status bar
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  playlistButton: {
    padding: 8,
  },
  videoContainer: {
    backgroundColor: '#000000',
    minHeight: 250,
    width: '100%',
    overflow: 'visible',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoInfo: {
    padding: 20,
  },
  videoDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginTop: 8,
  },
  progressInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 8,
  },
  navButtonQuiz: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  navButtonTextQuiz: {
    color: '#4CAF50',
  },
});
