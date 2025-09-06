import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Group {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'ministries' | 'forums';
  country: string;
  language: string;
  memberCount: number;
  discussionCount: number;
  createdAt: Date;
  createdBy: string;
}

export interface Discussion {
  id: string;
  groupId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  replyCount: number;
}

export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  parentReplyId?: string; // For threaded replies
}

export interface UserGroupMembership {
  userId: string;
  groupId: string;
  joinedAt: Date;
  subscribedToNotifications: boolean;
}

// Sample data
const sampleGroups: Group[] = [
  {
    id: '1',
    title: 'Youth Ministry',
    description: 'A vibrant community for young people to grow in faith, build relationships, and serve together. Join us for weekly meetings, events, and spiritual growth opportunities.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'United States',
    language: 'English',
    memberCount: 45,
    discussionCount: 12,
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin',
  },
  {
    id: '2',
    title: 'Prayer Warriors',
    description: 'A dedicated group focused on prayer and intercession. Share prayer requests, testimonies, and support one another in spiritual warfare.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'Canada',
    language: 'English',
    memberCount: 78,
    discussionCount: 23,
    createdAt: new Date('2024-01-10'),
    createdBy: 'admin',
  },
  {
    id: '3',
    title: 'Bible Study Fellowship',
    description: 'Deep dive into God\'s Word together. Weekly Bible studies, theological discussions, and spiritual insights shared in a supportive environment.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'United Kingdom',
    language: 'English',
    memberCount: 32,
    discussionCount: 8,
    createdAt: new Date('2024-01-20'),
    createdBy: 'admin',
  },
  {
    id: '4',
    title: 'Christian Parenting',
    description: 'A supportive community for parents raising children in faith. Share experiences, ask questions, and learn from one another\'s parenting journey.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
    category: 'forums',
    country: 'Australia',
    language: 'English',
    memberCount: 67,
    discussionCount: 19,
    createdAt: new Date('2024-01-05'),
    createdBy: 'admin',
  },
  {
    id: '5',
    title: 'Worship Team',
    description: 'For musicians, singers, and worship leaders. Share resources, discuss worship theology, and coordinate ministry opportunities.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'United States',
    language: 'English',
    memberCount: 23,
    discussionCount: 6,
    createdAt: new Date('2024-01-12'),
    createdBy: 'admin',
  },
  {
    id: '6',
    title: 'Christian Business Network',
    description: 'Connect with fellow Christian entrepreneurs and professionals. Share business insights, ethical dilemmas, and support one another in faith-based business practices.',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
    category: 'forums',
    country: 'Canada',
    language: 'English',
    memberCount: 89,
    discussionCount: 31,
    createdAt: new Date('2024-01-08'),
    createdBy: 'admin',
  },
  {
    id: '7',
    title: 'Ministère de la Jeunesse',
    description: 'Une communauté vibrante pour les jeunes qui grandissent dans la foi. Rejoignez-nous pour des réunions hebdomadaires et des opportunités de croissance spirituelle.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'France',
    language: 'French',
    memberCount: 38,
    discussionCount: 9,
    createdAt: new Date('2024-01-18'),
    createdBy: 'admin',
  },
  {
    id: '8',
    title: 'Ministerio de Jóvenes',
    description: 'Una comunidad vibrante para jóvenes que crecen en la fe. Únete a nosotros para reuniones semanales y oportunidades de crecimiento espiritual.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'Spain',
    language: 'Spanish',
    memberCount: 42,
    discussionCount: 11,
    createdAt: new Date('2024-01-22'),
    createdBy: 'admin',
  },
  {
    id: '9',
    title: 'Jugendministerium',
    description: 'Eine lebendige Gemeinschaft für junge Menschen, die im Glauben wachsen. Schließen Sie sich uns für wöchentliche Treffen und spirituelle Wachstumsmöglichkeiten an.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    category: 'ministries',
    country: 'Germany',
    language: 'German',
    memberCount: 29,
    discussionCount: 7,
    createdAt: new Date('2024-01-25'),
    createdBy: 'admin',
  },
  {
    id: '10',
    title: 'Parenting Chrétien',
    description: 'Une communauté de soutien pour les parents qui élèvent leurs enfants dans la foi. Partagez vos expériences et apprenez les uns des autres.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
    category: 'forums',
    country: 'France',
    language: 'French',
    memberCount: 54,
    discussionCount: 15,
    createdAt: new Date('2024-01-14'),
    createdBy: 'admin',
  },
];

const sampleDiscussions: Discussion[] = [
  {
    id: '1',
    groupId: '1',
    title: 'Upcoming Youth Retreat Planning',
    content: 'Let\'s discuss the details for our upcoming youth retreat. What activities should we include?',
    authorId: 'user1',
    authorName: 'Sarah Johnson',
    createdAt: new Date('2024-01-25'),
    replyCount: 5,
  },
  {
    id: '2',
    groupId: '1',
    title: 'Weekly Bible Study Topics',
    content: 'What topics would you like to explore in our weekly Bible study sessions?',
    authorId: 'user2',
    authorName: 'Mike Chen',
    createdAt: new Date('2024-01-26'),
    replyCount: 3,
  },
  {
    id: '3',
    groupId: '2',
    title: 'Prayer Request: Family Health',
    content: 'Please pray for my family as we\'re going through some health challenges.',
    authorId: 'user3',
    authorName: 'Lisa Rodriguez',
    createdAt: new Date('2024-01-24'),
    replyCount: 8,
  },
];

const sampleReplies: Reply[] = [
  {
    id: '1',
    discussionId: '1',
    content: 'I think we should include team building activities and worship sessions.',
    authorId: 'user4',
    authorName: 'David Wilson',
    createdAt: new Date('2024-01-25T10:30:00'),
  },
  {
    id: '2',
    discussionId: '1',
    content: 'Great idea! We could also add some outdoor activities if weather permits.',
    authorId: 'user5',
    authorName: 'Emily Brown',
    createdAt: new Date('2024-01-25T11:15:00'),
  },
];

// Initialize sample data
export const initializeGroupData = async () => {
  try {
    // Add sample groups
    for (const group of sampleGroups) {
      await setDoc(doc(db, 'groups', group.id), {
        ...group,
        createdAt: serverTimestamp(),
      });
    }

    // Add sample discussions
    for (const discussion of sampleDiscussions) {
      await setDoc(doc(db, 'discussions', discussion.id), {
        ...discussion,
        createdAt: serverTimestamp(),
      });
    }

    // Add sample replies
    for (const reply of sampleReplies) {
      await setDoc(doc(db, 'replies', reply.id), {
        ...reply,
        createdAt: serverTimestamp(),
      });
    }

    console.log('Group sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing group data:', error);
  }
};

// Fetch all groups
export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const groups: Group[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      groups.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        country: data.country || 'Unknown',
        language: data.language || 'English',
        memberCount: data.memberCount || 0,
        discussionCount: data.discussionCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      });
    });

    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

// Fetch group by ID
export const fetchGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    if (groupDoc.exists()) {
      const data = groupDoc.data();
      return {
        id: groupDoc.id,
        title: data.title,
        description: data.description,
        image: data.image,
        category: data.category,
        country: data.country || 'Unknown',
        language: data.language || 'English',
        memberCount: data.memberCount || 0,
        discussionCount: data.discussionCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching group:', error);
    return null;
  }
};

// Fetch discussions for a group
export const fetchDiscussionsByGroupId = async (groupId: string): Promise<Discussion[]> => {
  try {
    const discussionsRef = collection(db, 'discussions');
    const q = query(
      discussionsRef,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const discussions: Discussion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      discussions.push({
        id: doc.id,
        groupId: data.groupId,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt?.toDate() || new Date(),
        replyCount: data.replyCount || 0,
      });
    });

    return discussions;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    return [];
  }
};

// Fetch discussion by ID
export const fetchDiscussionById = async (discussionId: string): Promise<Discussion | null> => {
  try {
    const discussionDoc = await getDoc(doc(db, 'discussions', discussionId));
    if (discussionDoc.exists()) {
      const data = discussionDoc.data();
      return {
        id: discussionDoc.id,
        groupId: data.groupId,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt?.toDate() || new Date(),
        replyCount: data.replyCount || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching discussion:', error);
    return null;
  }
};

// Fetch replies for a discussion
export const fetchRepliesByDiscussionId = async (discussionId: string): Promise<Reply[]> => {
  try {
    const repliesRef = collection(db, 'replies');
    const q = query(
      repliesRef,
      where('discussionId', '==', discussionId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const replies: Reply[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      replies.push({
        id: doc.id,
        discussionId: data.discussionId,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        createdAt: data.createdAt?.toDate() || new Date(),
        parentReplyId: data.parentReplyId,
      });
    });

    return replies;
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
};

// Check if user is member of a group
export const checkUserGroupMembership = async (userId: string, groupId: string): Promise<UserGroupMembership | null> => {
  try {
    const membershipDoc = await getDoc(doc(db, 'userGroupMemberships', `${userId}_${groupId}`));
    console.log('membershipDoc', membershipDoc.exists());
    if (membershipDoc.exists()) {
      const data = membershipDoc.data();

      if (data.leftAt || !data.joinedAt) {
        return null;
      }

      return {
        userId: data.userId,
        groupId: data.groupId,
        joinedAt: data.joinedAt?.toDate(),
        subscribedToNotifications: data.subscribedToNotifications || false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error checking group membership:', error);
    return null;
  }
};

// Join a group
export const joinGroup = async (userId: string, groupId: string): Promise<void> => {
  try {
    const membershipRef = doc(db, 'userGroupMemberships', `${userId}_${groupId}`);
    await setDoc(membershipRef, {
      userId,
      groupId,
      joinedAt: serverTimestamp(),
      subscribedToNotifications: false,
    });

    // Update group member count
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const currentCount = groupDoc.data().memberCount || 0;
      await updateDoc(groupRef, {
        memberCount: currentCount + 1,
      });
    }
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (userId: string, groupId: string): Promise<void> => {
  try {
    const membershipRef = doc(db, 'userGroupMemberships', `${userId}_${groupId}`);
    await setDoc(membershipRef, {
      userId,
      groupId,
      leftAt: serverTimestamp(),
    });

    // Update group member count
    const groupRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const currentCount = groupDoc.data().memberCount || 0;
      await updateDoc(groupRef, {
        memberCount: Math.max(0, currentCount - 1),
      });
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Toggle notification subscription
export const toggleGroupNotifications = async (userId: string, groupId: string, subscribed: boolean): Promise<void> => {
  try {
    const membershipRef = doc(db, 'userGroupMemberships', `${userId}_${groupId}`);
    await updateDoc(membershipRef, {
      subscribedToNotifications: subscribed,
    });
  } catch (error) {
    console.error('Error toggling notifications:', error);
    throw error;
  }
};

// Create a new discussion
export const createDiscussion = async (discussion: Omit<Discussion, 'id' | 'createdAt' | 'replyCount'>): Promise<string> => {
  try {
    const discussionsRef = collection(db, 'discussions');
    const docRef = await addDoc(discussionsRef, {
      ...discussion,
      createdAt: serverTimestamp(),
      replyCount: 0,
    });

    // Update group discussion count
    const groupRef = doc(db, 'groups', discussion.groupId);
    const groupDoc = await getDoc(groupRef);
    if (groupDoc.exists()) {
      const currentCount = groupDoc.data().discussionCount || 0;
      await updateDoc(groupRef, {
        discussionCount: currentCount + 1,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
};

// Create a new reply
export const createReply = async (reply: Omit<Reply, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const repliesRef = collection(db, 'replies');
    const docRef = await addDoc(repliesRef, {
      ...reply,
      createdAt: serverTimestamp(),
    });

    // Update discussion reply count
    const discussionRef = doc(db, 'discussions', reply.discussionId);
    const discussionDoc = await getDoc(discussionRef);
    if (discussionDoc.exists()) {
      const currentCount = discussionDoc.data().replyCount || 0;
      await updateDoc(discussionRef, {
        replyCount: currentCount + 1,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

// Check if a user is a member of a specific group
export const isUserMemberOfGroup = async (userId: string, groupId: string): Promise<boolean> => {
  try {
    const membershipsRef = collection(db, 'userGroupMemberships');
    const membershipQuery = query(
      membershipsRef, 
      where('userId', '==', userId),
      where('groupId', '==', groupId)
    );
    const membershipSnapshot = await getDocs(membershipQuery);
    
    if (membershipSnapshot.empty) {
      return false;
    }
    
    // Check if the user has left the group (leftAt property exists)
    const membershipDoc = membershipSnapshot.docs[0];
    const membershipData = membershipDoc.data();
    
    // If leftAt property exists, user is not a member
    if (membershipData.leftAt) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
};

// Fetch groups that a user has joined
export const fetchUserJoinedGroups = async (userId: string): Promise<Group[]> => {
  try {
    // First, get all group memberships for the user
    const membershipsRef = collection(db, 'userGroupMemberships');
    const membershipsQuery = query(membershipsRef, where('userId', '==', userId));
    const membershipsSnapshot = await getDocs(membershipsQuery);
    
    if (membershipsSnapshot.empty) {
      return [];
    }

    // Get all group IDs the user has joined (excluding groups they've left)
    const groupIds = membershipsSnapshot.docs
      .filter(doc => !doc.data().leftAt) // Exclude groups where user has left
      .map(doc => doc.data().groupId);
    
    // Fetch the actual group data for each group ID
    const groups: Group[] = [];
    for (const groupId of groupIds) {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        groups.push({
          id: groupDoc.id,
          title: data.title,
          description: data.description,
          image: data.image,
          category: data.category,
          country: data.country || 'Unknown',
          language: data.language || 'English',
          memberCount: data.memberCount || 0,
          discussionCount: data.discussionCount || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          createdBy: data.createdBy,
        });
      }
    }

    // Sort by join date (most recently joined first)
    return groups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching user joined groups:', error);
    return [];
  }
};
