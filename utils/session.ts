import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionData {
  userId: string;
  name: string;
}

export async function startSession(userData: SessionData): Promise<void> {
  try {
    await AsyncStorage.setItem('session', JSON.stringify({
      ...userData,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error starting session:', error);
    throw new Error('Failed to start session');
  }
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const sessionData = await AsyncStorage.getItem('session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    return {
      userId: session.userId,
      name: session.name,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function endSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem('session');
  } catch (error) {
    console.error('Error ending session:', error);
    throw new Error('Failed to end session');
  }
}

export async function isSessionActive(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
} 