import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
  fetchDiscussionById, 
  fetchRepliesByDiscussionId, 
  createReply,
  isUserMemberOfGroup,
  Discussion, 
  Reply 
} from '../../../services/groupService';
import { useUserStore } from '../../../stores/userStore';

export default function DiscussionThreadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserStore();
  
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGroupMember, setIsGroupMember] = useState(false);

  useEffect(() => {
    const loadDiscussionData = async () => {
      if (typeof id === 'string') {
        try {
          setLoading(true);
          
          // Load discussion
          const fetchedDiscussion = await fetchDiscussionById(id);
          setDiscussion(fetchedDiscussion);
          
          if (fetchedDiscussion && user) {
            // Check if user is a member of the group
            const memberStatus = await isUserMemberOfGroup(user.uid, fetchedDiscussion.groupId);
            setIsGroupMember(memberStatus);
            
            // Load replies
            const fetchedReplies = await fetchRepliesByDiscussionId(id);
            setReplies(fetchedReplies);
          }
        } catch (error) {
          console.error('Error loading discussion data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDiscussionData();
  }, [id]);

  const handleSubmitReply = async () => {
    if (!user || !discussion || !newReply.trim() || !isGroupMember) return;
    
    try {
      setSubmitting(true);
      
      const replyData = {
        discussionId: discussion.id,
        content: newReply.trim(),
        authorId: user.uid,
        authorName: `${user.profile?.firstName} ${user.profile?.lastName}`,
      };
      
      await createReply(replyData);
      
      // Add the new reply to the local state
      const newReplyObj: Reply = {
        id: Date.now().toString(), // Temporary ID
        discussionId: discussion.id,
        content: newReply.trim(),
        authorId: user.uid,
        authorName: `${user.profile?.firstName} ${user.profile?.lastName}`,
        createdAt: new Date(),
      };
      
      setReplies(prev => [...prev, newReplyObj]);
      setNewReply('');
      
      // Update discussion reply count
      setDiscussion(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', 'Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReplyItem = ({ item }: { item: Reply }) => (
    <View style={styles.replyItem}>
      <View style={styles.replyHeader}>
        <Text style={styles.replyAuthor}>{item.authorName}</Text>
        <Text style={styles.replyDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.replyContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading discussion...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!discussion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Discussion not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Discussion
          </Text>
        </View>

        <View style={styles.content}>
          {/* Discussion */}
          <View style={styles.discussionSection}>
            <Text style={styles.discussionTitle}>{discussion.title}</Text>
            <Text style={styles.discussionContent}>{discussion.content}</Text>
            <View style={styles.discussionFooter}>
              <Text style={styles.discussionAuthor}>by {discussion.authorName}</Text>
              <Text style={styles.discussionDate}>
                {discussion.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Replies */}
          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Text>
            
            {replies.length === 0 ? (
              <View style={styles.emptyReplies}>
                <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyRepliesText}>No replies yet</Text>
                <Text style={styles.emptyRepliesSubtext}>Be the first to reply!</Text>
              </View>
            ) : (
              <FlatList
                data={replies}
                renderItem={renderReplyItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.repliesList}
              />
            )}
          </View>
        </View>

        {/* Reply Input */}
        <View style={styles.replyInputContainer}>
          <View style={[
            styles.replyInputWrapper,
            !isGroupMember && styles.replyInputWrapperDisabled
          ]}>
            <TextInput
              style={[
                styles.replyInput,
                !isGroupMember && styles.replyInputDisabled
              ]}
              placeholder={isGroupMember ? "Write a reply..." : "Join the group to participate in discussions"}
              value={newReply}
              onChangeText={setNewReply}
              multiline
              maxLength={500}
              placeholderTextColor="#8E8E93"
              editable={isGroupMember}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!newReply.trim() || submitting || !isGroupMember) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitReply}
              disabled={!newReply.trim() || submitting || !isGroupMember}
            >
              <Ionicons 
                name={isGroupMember ? "send" : "lock-closed"}
                size={20} 
                color={newReply.trim() && !submitting && isGroupMember ? '#FFFFFF' : '#8E8E93'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  discussionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 26,
  },
  discussionContent: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
    marginBottom: 16,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discussionAuthor: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  discussionDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  repliesSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    padding: 20,
    paddingBottom: 12,
  },
  emptyReplies: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyRepliesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyRepliesSubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  repliesList: {
    paddingHorizontal: 20,
  },
  replyItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  replyDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  replyContent: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  replyInputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  replyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyInputWrapperDisabled: {
    backgroundColor: '#F8F9FA',
    opacity: 0.6,
  },
  replyInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
    paddingVertical: 8,
  },
  replyInputDisabled: {
    color: '#8E8E93',
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
});
