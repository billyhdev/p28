import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../services/courseService';

interface PlaylistDrawerProps {
  videos: Video[];
  currentVideoId: string;
  completedVideos: string[];
  onVideoSelect: (video: Video) => void;
  onClose: () => void;
  visible: boolean;
}

export default function PlaylistDrawer({ 
  videos, 
  currentVideoId, 
  completedVideos, 
  onVideoSelect, 
  onClose, 
  visible 
}: PlaylistDrawerProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => {
    const isCurrentVideo = item.id === currentVideoId;
    const isCompleted = completedVideos.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.videoItem,
          isCurrentVideo && styles.currentVideoItem,
        ]}
        onPress={() => onVideoSelect(item)}
      >
        <View style={styles.videoThumbnail}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
          )}
          <View style={styles.durationOverlay}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>
        
        <View style={styles.videoInfo}>
          <Text style={[styles.videoTitle, isCurrentVideo && styles.currentVideoTitle]}>
            {index + 1}. {item.title}
          </Text>
          <Text style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        
        {isCurrentVideo && (
          <View style={styles.currentIndicator}>
            <Ionicons name="play-circle" size={20} color="#007AFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Course Videos</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        />
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {completedVideos.length} of {videos.length} videos completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedVideos.length / videos.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  videoList: {
    paddingBottom: 80,
  },
  videoItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  currentVideoItem: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  videoThumbnail: {
    width: 80,
    height: 45,
    borderRadius: 4,
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  completedBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  durationText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  currentVideoTitle: {
    color: '#007AFF',
    fontWeight: '600',
  },
  videoDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  currentIndicator: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  progressInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});
