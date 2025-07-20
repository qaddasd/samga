import OneSignal from 'react-onesignal';

/**
 * Send a notification about a new grade to a specific user
 * 
 * @param userId - The OneSignal user ID for the specific recipient
 * @param subject - Subject name
 * @param grade - The grade that was received
 * @param teacher - Teacher who gave the grade
 * @param timestamp - When the grade was given
 */
export const sendGradeNotification = async (
  userId: string, 
  subject: string, 
  grade: string | number,
  teacher?: string,
  timestamp?: string
) => {
  try {
    // Cast to any to access methods that may not be in the TypeScript definitions
    await (OneSignal as any).sendSelfNotification(
      'Новая оценка', // Title
      `${subject}: ${grade}`, // Message
      '/?page=grades', // URL to open when clicked
      {
        // Custom data for the notification
        type: 'grade',
        subject,
        grade,
        teacher,
        timestamp: timestamp || new Date().toISOString(),
        userId
      },
      // Target just this specific user
      [userId]
    );
    
    return true;
  } catch (error) {
    console.error('Failed to send grade notification:', error);
    return false;
  }
};

/**
 * Format the notification for a grade
 */
export const formatGradeNotification = (subject: string, grade: string | number) => {
  return {
    title: 'Новая оценка',
    message: `${subject}: ${grade}`,
    url: '/?page=grades',
  };
};

/**
 * Subscribe to grade notifications
 */
export const subscribeToGradeNotifications = async () => {
  try {
    // Get user ID from localstorage
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      console.warn('Cannot subscribe to notifications: no user ID found');
      return false;
    }
    
    // Use OneSignal tags to set up notification preferences
    await (OneSignal as any).sendTags({
      grade_notifications: 'true',
      user_id: userId
    });
    
    return true;
  } catch (error) {
    console.error('Failed to subscribe to grade notifications:', error);
    return false;
  }
};

/**
 * Check if permission for notifications is granted
 */
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await (OneSignal as any).getNotificationPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}; 