import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  youtubeUrl: string;
}

interface PlaylistData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  videoCount: number;
  youtubeUrl: string;
  videos: PlaylistVideo[];
}

export default function WatchPlaylistScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Sample playlist data - in a real app, this would be fetched based on the ID
  const [playlist] = useState<PlaylistData>({
    id: id as string,
    title: 'Complete React Native Course',
    description: 'Master React Native development with this comprehensive playlist covering everything from basics to advanced concepts.',
    thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
    channel: 'Programming Hub',
    videoCount: 25,
    youtubeUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ixPUHQkXVdp00GqZqW85-r',
    videos: [
      {
        id: '1',
        title: 'Introduction to React Native',
        description: 'Learn the basics of React Native development.',
        thumbnail: 'https://img.youtube.com/vi/CGbNw855ksw/maxresdefault.jpg',
        duration: '15:30',
        youtubeUrl: 'https://www.youtube.com/watch?v=CGbNw855ksw',
      },
      {
        id: '2',
        title: 'Setting Up Your Development Environment',
        description: 'Step-by-step guide to setting up React Native.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:15',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        id: '3',
        title: 'Understanding Components',
        description: 'Learn about React components and their lifecycle.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:45',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ],
  });

  const handleBack = () => {
    router.back();
  };

  const handleVideoPress = (video: PlaylistVideo) => {
    router.push(`/screens/watch-video/${video.id}`);
  };

  const renderVideoItem = ({ item, index }: { item: PlaylistVideo; index: number }) => (
    <TouchableOpacity style={styles.videoItem} onPress={() => handleVideoPress(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {index + 1}. {item.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.videoDuration}>{item.duration}</Text>
      </View>
      <View style={styles.videoNumber}>
        <Text style={styles.videoNumberText}>{index + 1}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {playlist.title}
        </Text>
      </View>

      {/* Playlist Info */}
      <View style={styles.playlistInfo}>
        <Image source={{ uri: playlist.thumbnail }} style={styles.playlistThumbnail} />
        <View style={styles.playlistDetails}>
          <Text style={styles.playlistTitle}>{playlist.title}</Text>
          <Text style={styles.playlistChannel}>{playlist.channel}</Text>
          <Text style={styles.playlistStats}>{playlist.videoCount} videos</Text>
          <Text style={styles.playlistDescription} numberOfLines={2}>
            {playlist.description}
          </Text>
        </View>
      </View>

      {/* Videos List */}
      <FlatList
        data={playlist.videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.videosList}
      />
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
  playlistInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  playlistThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  playlistDetails: {
    alignItems: 'center',
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  playlistChannel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  playlistStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  playlistDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    textAlign: 'center',
  },
  videosList: {
    paddingVertical: 8,
  },
  videoItem: {
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
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    lineHeight: 22,
  },
  videoDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 12,
    color: '#8E8E93',
  },
  videoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  videoNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
});
