import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quiz, QuizQuestion } from '../services/courseService';

interface QuizComponentProps {
  quiz: Quiz;
  onSubmit: (answers: number[]) => void;
  onRetry: () => void;
  loading?: boolean;
}

export default function QuizComponent({ quiz, onSubmit, onRetry, loading = false }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, show results
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (answers.length !== quiz.questions.length) {
      Alert.alert('Incomplete Quiz', 'Please answer all questions before submitting.');
      return;
    }
    onSubmit(answers);
  };

  const handleRetry = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    onRetry();
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const getSelectedAnswer = (questionIndex: number) => {
    return answers[questionIndex];
  };

  if (showResults) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Review</Text>
          <Text style={styles.subtitle}>
            Review your answers before submitting
          </Text>
        </View>

        <ScrollView style={styles.questionsList}>
          {quiz.questions.map((question, index) => {
            const selectedAnswer = getSelectedAnswer(index);
            const isCorrect = selectedAnswer === question.correctAnswer;

            return (
              <View key={question.id} style={styles.reviewQuestion}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Question {index + 1}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: isCorrect ? '#4CAF50' : '#F44336' }]}>
                    <Ionicons 
                      name={isCorrect ? 'checkmark' : 'close'} 
                      size={16} 
                      color="#FFFFFF" 
                    />
                  </View>
                </View>
                
                <Text style={styles.questionText}>{question.question}</Text>
                
                <View style={styles.optionsList}>
                  {question.options.map((option, optionIndex) => (
                    <View key={optionIndex} style={styles.optionItem}>
                      <View style={[
                        styles.optionIndicator,
                        selectedAnswer === optionIndex && styles.selectedOption,
                        optionIndex === question.correctAnswer && styles.correctOption,
                        selectedAnswer === optionIndex && optionIndex !== question.correctAnswer && styles.incorrectOption,
                      ]}>
                        <Text style={[
                          styles.optionText,
                          selectedAnswer === optionIndex && styles.selectedOptionText,
                          optionIndex === question.correctAnswer && styles.correctOptionText,
                        ]}>
                          {String.fromCharCode(65 + optionIndex)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.optionLabel,
                        selectedAnswer === optionIndex && styles.selectedOptionLabel,
                        optionIndex === question.correctAnswer && styles.correctOptionLabel,
                      ]}>
                        {option}
                      </Text>
                    </View>
                  ))}
                </View>

                {question.explanation && (
                  <View style={styles.explanation}>
                    <Text style={styles.explanationTitle}>Explanation:</Text>
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
            <Text style={styles.retryButtonText}>Retry Quiz</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Course Quiz</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsList}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                answers[currentQuestionIndex] === index && styles.selectedOptionItem,
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={[
                styles.optionIndicator,
                answers[currentQuestionIndex] === index && styles.selectedOption,
              ]}>
                <Text style={[
                  styles.optionText,
                  answers[currentQuestionIndex] === index && styles.selectedOptionText,
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionLabel,
                answers[currentQuestionIndex] === index && styles.selectedOptionLabel,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]} 
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#007AFF" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, answers[currentQuestionIndex] === undefined && styles.navButtonDisabled]} 
          onPress={handleNext}
          disabled={answers[currentQuestionIndex] === undefined}
        >
          <Text style={styles.navButtonText}>
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Review' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsList: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F2F2F7',
  },
  selectedOptionItem: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#F44336',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  correctOptionText: {
    color: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  selectedOptionLabel: {
    color: '#007AFF',
    fontWeight: '500',
  },
  correctOptionLabel: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
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
  questionsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reviewQuestion: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explanation: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
