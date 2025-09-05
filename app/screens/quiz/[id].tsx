import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QuizComponent from '../../../components/QuizComponent';
import { fetchQuizByCourseId, submitQuizAttempt, Quiz } from '../../../services/courseService';
import { useUserStore } from '../../../stores/userStore';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (typeof id === 'string') {
        try {
          setLoading(true);
          const fetchedQuiz = await fetchQuizByCourseId(id);
          setQuiz(fetchedQuiz);
        } catch (error) {
          console.error('Error loading quiz:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadQuiz();
  }, [id]);

  const handleQuizSubmit = async (answers: number[]) => {
    if (!quiz || !user) return;

    try {
      setSubmitting(true);
      
      const quizAttempt = await submitQuizAttempt(user.uid, id as string, quiz.id, answers);
      
      if (quizAttempt.passed) {
        Alert.alert(
          'Congratulations! 🎉',
          `You passed the quiz with a score of ${quizAttempt.score.toFixed(1)}%!`,
          [
            {
              text: 'View Certificate',
              onPress: () => {
                // Navigate to certificate or completion screen
                router.push(`/screens/course-completion/${id}`);
              },
            },
            {
              text: 'Back to Courses',
              onPress: () => {
                router.push('/(tabs)/learning');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Quiz Failed',
          `Your score was ${quizAttempt.score.toFixed(1)}%. You need ${quiz.passingScore}% to pass.`,
          [
            {
              text: 'Retry Quiz',
              onPress: () => {
                // The quiz component will handle retry
              },
            },
            {
              text: 'Back to Course',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuizRetry = () => {
    // Reset quiz state - the QuizComponent will handle this
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quiz not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <QuizComponent
        quiz={quiz}
        onSubmit={handleQuizSubmit}
        onRetry={handleQuizRetry}
        loading={submitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
