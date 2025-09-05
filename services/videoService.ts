import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export interface Video {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  duration: string;
  channel: string;
  thumbnailUrl: string;
}

export const fetchVideos = async (): Promise<Video[]> => {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('title', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const videos: Video[] = [];
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      } as Video);
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};
