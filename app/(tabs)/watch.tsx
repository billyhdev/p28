import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface VideoItem {
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

interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  videoCount: number;
  youtubeUrl: string;
}

export default function WatchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists'>('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Sample data - in a real app, this would come from YouTube API
  const [videos] = useState<VideoItem[]>([
    {
      id: '1',
      title: 'React Native Tutorial for Beginners',
      description: 'Learn React Native from scratch with this comprehensive tutorial.',
      thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
      channel: 'Programming Hub',
      duration: '15:30',
      views: '125K',
      publishedAt: '2 weeks ago',
      youtubeUrl: 'https://www.youtube.com/watch?v=CGbNw855ksw',
    },
    {
      id: '2',
      title: 'JavaScript ES6+ Features Explained',
      description: 'Modern JavaScript features that every developer should know.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      channel: 'Code Masters',
      duration: '22:15',
      views: '89K',
      publishedAt: '1 month ago',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      id: '3',
      title: 'Flutter vs React Native Comparison',
      description: 'Which framework should you choose for mobile development?',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      channel: 'Tech Talk',
      duration: '18:45',
      views: '67K',
      publishedAt: '3 weeks ago',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  ]);

  const [playlists] = useState<PlaylistItem[]>([
    {
      id: '1',
      title: 'Complete React Native Course',
      description: 'Master React Native development with this comprehensive playlist.',
      thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
      channel: 'Programming Hub',
      videoCount: 25,
      youtubeUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ixPUHQkXVdp00GqZqW85-r',
    },
    {
      id: '2',
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from basics to advanced concepts.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      channel: 'Code Masters',
      videoCount: 18,
      youtubeUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ixPUHQkXVdp00GqZqW85-r',
    },
    {
      id: '3',
      title: 'Mobile App Development Guide',
      description: 'Complete guide to mobile app development with different frameworks.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      channel: 'Tech Talk',
      videoCount: 32,
      youtubeUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ixPUHQkXVdp00GqZqW85-r',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleVideoPress = (video: VideoItem) => {
    // Navigate to video player
    router.push(`/screens/watch-video/${video.id}`);
  };

  const handlePlaylistPress = (playlist: PlaylistItem) => {
    // Navigate to playlist view
    router.push(`/screens/watch-playlist/${playlist.id}`);
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoChannel}>{item.channel}</Text>
        <View style={styles.videoStats}>
          <Text style={styles.videoStatsText}>{item.views} views</Text>
          <Text style={styles.videoStatsText}>•</Text>
          <Text style={styles.videoStatsText}>{item.publishedAt}</Text>
        </View>
      </View>
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: PlaylistItem }) => (
    <TouchableOpacity style={styles.playlistItem} onPress={() => handlePlaylistPress(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.playlistThumbnail} />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.playlistChannel}>{item.channel}</Text>
        <Text style={styles.playlistStats}>{item.videoCount} videos</Text>
      </View>
      <View style={styles.playlistIcon}>
        <Ionicons name="play-circle" size={24} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watch</Text>
        <Text style={styles.headerSubtitle}>
          Browse videos and playlists
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos and playlists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'videos' && styles.activeTabButton]}
          onPress={() => setActiveTab('videos')}
        >
          <Ionicons 
            name="play-circle-outline" 
            size={20} 
            color={activeTab === 'videos' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'playlists' && styles.activeTabButton]}
          onPress={() => setActiveTab('playlists')}
        >
          <Ionicons 
            name="list-outline" 
            size={20} 
            color={activeTab === 'playlists' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
            Playlists
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'videos' ? (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#F0F8FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#007AFF',
  },
  contentList: {
    paddingVertical: 8,
  },
  videoItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  videoChannel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoStatsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  playlistItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playlistThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  playlistChannel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  playlistStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  playlistIcon: {
    marginLeft: 8,
  },
}); 
