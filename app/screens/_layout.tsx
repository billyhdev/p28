import { Stack } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="course-landing" />
      <Stack.Screen name="video-player" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="watch-video" />
      <Stack.Screen name="watch-playlist" />
      <Stack.Screen name="group-detail" />
      <Stack.Screen name="discussion-thread" />
      <Stack.Screen name="create-discussion" />
    </Stack>
  );
}
