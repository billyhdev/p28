import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Video } from '../services/courseService';

interface VideoPlayerProps {
  video: Video;
  onVideoEnd?: () => void;
  onVideoProgress?: (progress: number) => void;
  fullWidth?: boolean; // New prop to control margins
}

const { width, height } = Dimensions.get('window');
const videoHeight = Math.max(width * 0.5625, 250); // 16:9 aspect ratio with minimum height
const videoWidth = width; // Use full screen width

export default function VideoPlayer({ video, onVideoEnd, onVideoProgress, fullWidth = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const videoId = getYouTubeVideoId(video.youtubeUrl);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlaying(false);
      onVideoEnd?.();
    }
  }, [onVideoEnd]);

  const onReady = useCallback(() => {
    setLoading(false);
  }, []);

  const onError = useCallback((error: string) => {
    console.error('YouTube player error:', error);
    setLoading(false);
  }, []);

  const onPlaybackQualityChange = useCallback((quality: string) => {
    console.log('Playback quality changed:', quality);
  }, []);

  const onPlaybackRateChange = useCallback((rate: number) => {
    console.log('Playback rate changed:', rate);
  }, []);

  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Invalid YouTube URL</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, fullWidth && styles.fullWidthContainer]}>
      <YoutubePlayer
        height={videoHeight}
        width={videoWidth}
        play={playing}
        videoId={videoId}
        onStateChange={onStateChange}
        onReady={onReady}
        onError={onError}
        onPlaybackQualityChange={onPlaybackQualityChange}
        onPlaybackRateChange={onPlaybackRateChange}
        initialPlayerParams={{
          preventFullScreen: false,
          cc_lang_pref: 'us',
          showClosedCaptions: true,
          rel: 0,
          modestbranding: 0,
          controls: 1,
          fs: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: 'https://www.youtube.com',
        }}
        webViewStyle={styles.webView}
        webViewProps={{
          renderToHardwareTextureAndroid: true,
          androidLayerType: 'hardware',
          allowsInlineMediaPlayback: true,
          allowsFullscreenVideo: true,
          mediaPlaybackRequiresUserAction: false,
          javaScriptEnabled: true,
          domStorageEnabled: true,
          startInLoadingState: true,
          scalesPageToFit: true,
          scrollEnabled: false,
          bounces: false,
          showsHorizontalScrollIndicator: false,
          showsVerticalScrollIndicator: false,
        }}
        forceAndroidAutoplay={false}
        enableAutomaticInitialPlayback={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 250, // Increased minimum height for better control visibility
  },
  fullWidthContainer: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    width: '100%',
    overflow: 'visible',
  },
  webView: {
    opacity: 0.99,
    backgroundColor: '#000000',
  },
  errorContainer: {
    height: videoHeight,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
