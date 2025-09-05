import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  duration: number; // in seconds
  thumbnail: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videos: Video[];
  totalDuration: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
}

export interface UserProgress {
  userId: string;
  courseId: string;
  currentVideoId: string;
  completedVideos: string[];
  quizScore?: number;
  isCompleted: boolean;
  lastAccessed: Date;
  totalWatchTime: number; // in seconds
}

export interface UserQuizAttempt {
  userId: string;
  courseId: string;
  quizId: string;
  answers: number[]; // array of selected answer indices
  score: number;
  passed: boolean;
  completedAt: Date;
}

// Sample course data
const sampleCourse: Course = {
  id: 'react-native-basics',
  title: 'React Native Fundamentals',
  description: 'Learn the basics of React Native development with hands-on examples and real-world projects.',
  thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
  instructor: 'John Doe',
  category: 'Mobile Development',
  difficulty: 'beginner',
  videos: [
    {
      id: 'intro',
      title: 'Introduction to React Native',
      description: 'Welcome to React Native! Learn what React Native is and why it\'s powerful for mobile development.',
      youtubeUrl: 'https://www.youtube.com/watch?v=CGbNw855ksw',
      duration: 600, // 10 minutes
      thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
    },
    {
      id: 'setup',
      title: 'Setting Up Your Development Environment',
      description: 'Step-by-step guide to setting up React Native on your machine.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 900, // 15 minutes
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
    {
      id: 'components',
      title: 'Understanding Components',
      description: 'Learn about React components and how they work in React Native.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 1200, // 20 minutes
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    },
  ],
  totalDuration: 2700, // 45 minutes
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Sample quiz data
const sampleQuiz: Quiz = {
  id: 'react-native-basics-quiz',
  courseId: 'react-native-basics',
  questions: [
    {
      id: 'q1',
      question: 'What is React Native?',
      options: [
        'A JavaScript library for building user interfaces',
        'A framework for building native mobile apps using JavaScript',
        'A database management system',
        'A programming language'
      ],
      correctAnswer: 1,
      explanation: 'React Native is a framework that allows you to build native mobile applications using JavaScript and React.'
    },
    {
      id: 'q2',
      question: 'Which of the following is NOT a core component in React Native?',
      options: [
        'View',
        'Text',
        'Button',
        'div'
      ],
      correctAnswer: 3,
      explanation: 'div is an HTML element, not a React Native component. React Native uses View instead.'
    },
    {
      id: 'q3',
      question: 'What command is used to create a new React Native project?',
      options: [
        'npx create-react-native-app',
        'npx react-native init',
        'npx create-react-app',
        'npx expo init'
      ],
      correctAnswer: 1,
      explanation: 'npx react-native init is the command to create a new React Native project.'
    },
  ],
  passingScore: 70, // 70%
};

// Initialize sample data in Firestore
export const initializeSampleData = async () => {
  try {
    // Add sample course
    await setDoc(doc(db, 'courses', sampleCourse.id), sampleCourse);
    
    // Add sample quiz
    await setDoc(doc(db, 'quizzes', sampleQuiz.id), sampleQuiz);
    
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() } as Course);
    });
    
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Fetch a single course by ID
export const fetchCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    
    if (courseDoc.exists()) {
      return { id: courseDoc.id, ...courseDoc.data() } as Course;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

// Fetch quiz for a course
export const fetchQuizByCourseId = async (courseId: string): Promise<Quiz | null> => {
  try {
    const quizRef = collection(db, 'quizzes');
    const q = query(quizRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const quizDoc = querySnapshot.docs[0];
      return { id: quizDoc.id, ...quizDoc.data() } as Quiz;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
};

// Get user progress for a course
export const getUserProgress = async (userId: string, courseId: string): Promise<UserProgress | null> => {
  try {
    const progressDoc = await getDoc(doc(db, 'userProgress', `${userId}_${courseId}`));
    
    if (progressDoc.exists()) {
      return { id: progressDoc.id, ...progressDoc.data() } as UserProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return null;
  }
};

// Update user progress
export const updateUserProgress = async (userId: string, courseId: string, progress: Partial<UserProgress>): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', `${userId}_${courseId}`);
    await setDoc(progressRef, {
      userId,
      courseId,
      lastAccessed: new Date(),
      ...progress,
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user progress:', error);
  }
};

// Mark video as completed
export const markVideoCompleted = async (userId: string, courseId: string, videoId: string): Promise<void> => {
  try {
    const currentProgress = await getUserProgress(userId, courseId);
    const completedVideos = currentProgress?.completedVideos || [];
    
    if (!completedVideos.includes(videoId)) {
      await updateUserProgress(userId, courseId, {
        completedVideos: [...completedVideos, videoId],
      });
    }
  } catch (error) {
    console.error('Error marking video as completed:', error);
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (userId: string, courseId: string, quizId: string, answers: number[]): Promise<UserQuizAttempt> => {
  try {
    const quiz = await fetchQuizByCourseId(courseId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (quiz.questions[index] && answer === quiz.questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;
    
    const quizAttempt: UserQuizAttempt = {
      userId,
      courseId,
      quizId,
      answers,
      score,
      passed,
      completedAt: new Date(),
    };
    
    // Save quiz attempt
    await setDoc(doc(db, 'quizAttempts', `${userId}_${courseId}_${Date.now()}`), quizAttempt);
    
    // Update course completion status if passed
    if (passed) {
      await updateUserProgress(userId, courseId, {
        quizScore: score,
        isCompleted: true,
      });
    }
    
    return quizAttempt;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
};

// Get user's completed courses
export const getUserCompletedCourses = async (userId: string): Promise<Course[]> => {
  try {
    const progressRef = collection(db, 'userProgress');
    const q = query(progressRef, where('userId', '==', userId), where('isCompleted', '==', true));
    const querySnapshot = await getDocs(q);
    
    const completedCourses: Course[] = [];
    
    for (const doc of querySnapshot.docs) {
      const progress = doc.data() as UserProgress;
      const course = await fetchCourseById(progress.courseId);
      if (course) {
        completedCourses.push(course);
      }
    }
    
    return completedCourses;
  } catch (error) {
    console.error('Error fetching completed courses:', error);
    return [];
  }
};
