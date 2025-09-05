import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { fetchUserJoinedGroups, Group } from '../../services/groupService';
import { useUserStore } from '../../stores/userStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadJoinedGroups();
    }
  }, [user?.uid]);

  const loadJoinedGroups = async () => {
    try {
      setLoading(true);
      const groups = await fetchUserJoinedGroups(user?.uid || '');
      console.log('Loaded groups:', groups);
      
      // If no groups found, show sample data for testing
      if (groups.length === 0) {
        const sampleGroups = [
          {
            id: '1',
            title: 'Youth Ministry',
            description: 'A vibrant community for young people to grow in faith and fellowship together.',
            image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
            category: 'ministries' as const,
            country: 'United States',
            language: 'English',
            memberCount: 25,
            discussionCount: 12,
            createdAt: new Date(),
            createdBy: 'admin'
          },
          {
            id: '2',
            title: 'Prayer Warriors',
            description: 'Join us in powerful prayer sessions and intercession for our community.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            category: 'ministries' as const,
            country: 'Canada',
            language: 'English',
            memberCount: 18,
            discussionCount: 8,
            createdAt: new Date(),
            createdBy: 'admin'
          }
        ];
        setJoinedGroups(sampleGroups);
      } else {
        setJoinedGroups(groups);
      }
    } catch (error) {
      console.error('Error loading joined groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJoinedGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/screens/group-detail/${groupId}`);
  };

  const renderGroupItem = ({ item }: { item: Group }) => {
    console.log('Rendering group:', item.title, item.description);
    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => handleGroupPress(item.id)}
      >
        <View style={styles.groupImageContainer}>
          <Image source={{ uri: item.image }} style={styles.groupImage} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupTitle} numberOfLines={1}>
            {item.title || 'No Title'}
          </Text>
          <View style={styles.groupMeta}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{item.memberCount || 0} members</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="chatbubbles" size={14} color="#8E8E93" />
                <Text style={styles.metaText}>{item.discussionCount || 0} discussions</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <View style={styles.locationItem}>
                <Ionicons name="location" size={12} color="#8E8E93" />
                <Text style={styles.locationText}>{item.country || 'Unknown'}</Text>
              </View>
              <View style={[
                styles.categoryBadge,
                {
                  backgroundColor: item.category === 'ministries' ? '#E8F5E8' : '#F0F8FF',
                }
              ]}>
                <Text style={[
                  styles.categoryText,
                  {
                    color: item.category === 'ministries' ? '#4CAF50' : '#007AFF',
                  }
                ]}>
                  {item.category === 'ministries' ? 'Ministry' : 'Forum'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="home" size={64} color="#007AFF" />
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Groups</Text>
          <Text style={styles.subtitle}>Quick access to your joined groups</Text>
        </View>

        {joinedGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="people-outline" size={64} color="#8E8E93" />
            </View>
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptyDescription}>
              You haven't joined any groups yet. Explore groups to connect with others!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/groups')}
            >
              <Text style={styles.exploreButtonText}>Explore Groups</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.horizontalContainer}>
            <FlatList
              data={joinedGroups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContainer}
            />
          </View>
        )}

        {/* Global News Section */}
        <View style={styles.newsSection}>
          <View style={styles.newsSectionHeader}>
            <Text style={styles.newsSectionTitle}>Global News</Text>
            <Text style={styles.newsSectionSubtitle}>Latest updates from groups worldwide</Text>
          </View>
          
          <View style={styles.comingSoonContainer}>
            <Ionicons name="newspaper-outline" size={64} color="#8E8E93" />
            <Text style={styles.comingSoonTitle}>Coming Soon</Text>
            <Text style={styles.comingSoonText}>
              We're working on bringing you the latest news and updates from groups around the world.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  horizontalContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  horizontalListContainer: {
    paddingHorizontal: 20,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 280,
    minHeight: 240,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'column',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // News Section Styles
  newsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  newsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  newsSectionSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  newsSectionHeader: {
    marginBottom: 20,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
});
