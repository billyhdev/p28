import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/userStore';
import { getUserCompletedCourses, Course } from '../../services/courseService';

export default function ProfileScreen() {
  const { user, logout } = useUserStore();
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCompletedCourses = async () => {
      if (user) {
        try {
          const courses = await getUserCompletedCourses(user.uid);
          setCompletedCourses(courses);
        } catch (error) {
          console.error('Error loading completed courses:', error);
        }
      }
    };

    loadCompletedCourses();
  }, [user]);

  const CompletedCoursesList = () => {
    if (completedCourses.length === 0) {
      return (
        <View style={styles.emptyCoursesContainer}>
          <Ionicons name="trophy-outline" size={32} color="#C7C7CC" />
          <Text style={styles.emptyCoursesText}>No completed courses yet</Text>
          <Text style={styles.emptyCoursesSubtext}>Start learning to earn certificates!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={completedCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.completedCourseItem}>
            <Image source={{ uri: item.thumbnail }} style={styles.courseThumbnail} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.courseInstructor}>{item.instructor}</Text>
            </View>
            <View style={styles.completionBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled automatically by the root layout
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#007AFF" />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.name}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        {/* Profile Details */}
        {user.profile && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>First Name</Text>
              <Text style={styles.detailValue}>{user.profile.firstName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Last Name</Text>
              <Text style={styles.detailValue}>{user.profile.lastName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Country</Text>
              <Text style={styles.detailValue}>{user.profile.country}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Birthdate</Text>
              <Text style={styles.detailValue}>{formatDate(user.profile.birthdate)}</Text>
            </View>
          </View>
        )}

        {/* Completed Courses */}
        <View style={styles.completedCoursesSection}>
          <Text style={styles.sectionTitle}>Completed Courses</Text>
          <CompletedCoursesList />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  completedCoursesSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  emptyCoursesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCoursesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyCoursesSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  completedCourseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  courseThumbnail: {
    width: 60,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  courseInstructor: {
    fontSize: 12,
    color: '#8E8E93',
  },
  completionBadge: {
    marginLeft: 8,
  },
});
