import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../../../components/VideoPlayer';

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: string;
  views: string;
  publishedAt: string;
  youtubeUrl: string;
}

export default function WatchVideoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Sample video data - in a real app, this would be fetched based on the ID
  const [video] = useState<VideoData>({
    id: id as string,
    title: 'React Native Tutorial for Beginners',
    description: 'Learn React Native from scratch with this comprehensive tutorial. We\'ll cover everything from basic concepts to advanced features, including state management, navigation, and API integration.',
    thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
    channel: 'Programming Hub',
    duration: '15:30',
    views: '125K',
    publishedAt: '2 weeks ago',
    youtubeUrl: 'https://www.youtube.com/watch?v=CGbNw855ksw',
  });

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {video.title}
        </Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <VideoPlayer 
          video={{
            id: video.id,
            title: video.title,
            description: video.description,
            youtubeUrl: video.youtubeUrl,
            duration: 930, // Convert 15:30 to seconds
            thumbnail: video.thumbnail,
          }}
        />
      </View>

      {/* Video Info */}
      <ScrollView style={styles.content}>
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          
          <View style={styles.videoStats}>
            <Text style={styles.videoViews}>{video.views} views</Text>
            <Text style={styles.videoDot}>•</Text>
            <Text style={styles.videoDate}>{video.publishedAt}</Text>
          </View>

          <View style={styles.channelInfo}>
            <View style={styles.channelAvatar}>
              <Ionicons name="person-circle" size={40} color="#007AFF" />
            </View>
            <View style={styles.channelDetails}>
              <Text style={styles.channelName}>{video.channel}</Text>
              <Text style={styles.subscriberCount}>1.2M subscribers</Text>
            </View>
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.videoDescription}>{video.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="thumbs-up-outline" size={20} color="#8E8E93" />
            <Text style={styles.actionButtonText}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="thumbs-down-outline" size={20} color="#8E8E93" />
            <Text style={styles.actionButtonText}>Dislike</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.actionButtonText}>Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#8E8E93" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  videoContainer: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoViews: {
    fontSize: 14,
    color: '#8E8E93',
  },
  videoDot: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  videoDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  channelAvatar: {
    marginRight: 12,
  },
  channelDetails: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  subscriberCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  subscribeButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
