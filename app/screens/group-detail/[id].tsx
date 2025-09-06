import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Alert, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  fetchGroupById, 
  fetchDiscussionsByGroupId, 
  checkUserGroupMembership, 
  joinGroup, 
  leaveGroup, 
  toggleGroupNotifications,
  Group, 
  Discussion 
} from '../../../services/groupService';
import { useUserStore } from '../../../stores/userStore';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [subscribedToNotifications, setSubscribedToNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDiscussions = async () => {
    if (typeof id === 'string') {
      try {
        const fetchedDiscussions = await fetchDiscussionsByGroupId(id);
        setDiscussions(fetchedDiscussions);
      } catch (error) {
        console.error('Error loading discussions:', error);
      }
    }
  };

  const loadGroupData = async () => {
    if (typeof id === 'string') {
      try {
        const fetchedGroup = await fetchGroupById(id);
        setGroup(fetchedGroup);
      } catch (error) {
        console.error('Error loading group data:', error);
      }
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (typeof id === 'string' && user) {
        try {
          setLoading(true);
          
          // Load group
          await loadGroupData();
          
          if (group) {
            // Load discussions
            await loadDiscussions();
            
            // Check membership
            const membership = await checkUserGroupMembership(user.uid, id);
            setIsMember(!!membership);
            setSubscribedToNotifications(membership?.subscribedToNotifications || false);
          }
        } catch (error) {
          console.error('Error loading group data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadInitialData();
  }, [id, user]);

  // Reload group data and discussions when screen comes into focus (e.g., after creating a discussion)
  useFocusEffect(
    React.useCallback(() => {

      const reloadData = async () => {
        if (id) {
          // Reload both group data (for updated discussionCount) and discussions
          loadGroupData();
          loadDiscussions();

          const membership = await checkUserGroupMembership(user?.uid, id);
          setIsMember(!!membership);
          setSubscribedToNotifications(membership?.subscribedToNotifications || false);
        }
      }

      reloadData()

    }, [id])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload both group data and discussions
      await Promise.all([
        loadGroupData(),
        loadDiscussions()
      ]);

      const membership = await checkUserGroupMembership(user?.uid, id);
      setIsMember(!!membership);
      setSubscribedToNotifications(membership?.subscribedToNotifications || false);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !group) return;
    
    try {
      setJoining(true);
      await joinGroup(user.uid, group.id);
      setIsMember(true);
      setSubscribedToNotifications(false);
      
      // Update local group member count
      setGroup(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
      
      Alert.alert('Success', 'You have joined the group!');
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join the group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !group) return;
    
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(user.uid, group.id);
              setIsMember(false);
              setSubscribedToNotifications(false);
              
              // Update local group member count
              setGroup(prev => prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : null);
              
              Alert.alert('Success', 'You have left the group.');
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave the group. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!user || !group) return;
    
    try {
      await toggleGroupNotifications(user.uid, group.id, value);
      setSubscribedToNotifications(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const handleDiscussionPress = (discussion: Discussion) => {
    router.push(`/screens/discussion-thread/${discussion.id}`);
  };

  const handleCreateDiscussion = () => {
    if (!isMember) {
      Alert.alert('Join Required', 'You must be a member to create discussions.');
      return;
    }
    router.push(`/screens/create-discussion/${group?.id}`);
  };

  const renderDiscussionItem = ({ item }: { item: Discussion }) => (
    <TouchableOpacity style={styles.discussionItem} onPress={() => handleDiscussionPress(item)}>
      <View style={styles.discussionHeader}>
        <Text style={styles.discussionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.discussionStats}>
          <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
          <Text style={styles.discussionStatText}>{item.replyCount} replies</Text>
        </View>
      </View>
      
      <Text style={styles.discussionContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <View style={styles.discussionFooter}>
        <Text style={styles.discussionAuthor}>by {item.authorName}</Text>
        <Text style={styles.discussionDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.title}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Group Image */}
        <Image source={{ uri: group.image }} style={styles.groupImage} />
        
        {/* Group Info */}
        <View style={styles.groupInfo}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: group.category === 'ministries' ? '#E8F5E8' : '#F0F8FF' }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: group.category === 'ministries' ? '#4CAF50' : '#007AFF' }
              ]}>
                {group.category === 'ministries' ? 'Ministry' : 'Forum'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.groupDescription}>{group.description}</Text>
          
          <View style={styles.groupStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color="#8E8E93" />
              <Text style={styles.statText}>{group.memberCount} members</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={20} color="#8E8E93" />
              <Text style={styles.statText}>{group.discussionCount} discussions</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isMember ? styles.leaveButton : styles.joinButton,
              joining && styles.disabledButton
            ]}
            onPress={isMember ? handleLeaveGroup : handleJoinGroup}
            disabled={joining}
          >
            <Ionicons 
              name={isMember ? 'exit-outline' : 'add'} 
              size={20} 
              color={isMember ? '#FF3B30' : '#FFFFFF'} 
            />
            <Text style={[
              styles.actionButtonText,
              isMember ? styles.leaveButtonText : styles.joinButtonText
            ]}>
              {joining ? 'Joining...' : isMember ? 'Leave Group' : 'Join Group'}
            </Text>
          </TouchableOpacity>

          {isMember && (
            <View style={styles.notificationToggle}>
              <Text style={styles.notificationLabel}>Notifications</Text>
              <Switch
                value={subscribedToNotifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}
        </View>

        {/* Discussions Section */}
        <View style={styles.discussionsSection}>
          <View style={styles.discussionsHeader}>
            <Text style={styles.discussionsTitle}>Discussions</Text>
            {isMember && (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateDiscussion}>
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.createButtonText}>New Discussion</Text>
              </TouchableOpacity>
            )}
          </View>

          {discussions.length === 0 ? (
            <View style={styles.emptyDiscussions}>
              <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyDiscussionsText}>No discussions yet</Text>
              <Text style={styles.emptyDiscussionsSubtext}>
                {isMember ? 'Start the first discussion!' : 'Join the group to participate'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={discussions}
              renderItem={renderDiscussionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
  content: {
    flex: 1,
  },
  groupImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  groupInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 12,
    lineHeight: 30,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  groupDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 16,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  actionButtons: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
  },
  leaveButtonText: {
    color: '#FFFFFF',
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notificationLabel: {
    fontSize: 16,
    color: '#000000',
  },
  discussionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  discussionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  discussionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyDiscussions: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyDiscussionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDiscussionsSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  discussionItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  discussionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 12,
    lineHeight: 22,
  },
  discussionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discussionStatText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  discussionContent: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discussionAuthor: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  discussionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
