import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

export const useCookie = () => {
  const cookieData = useSelector((state: RootState) => state.cookie.data);
  const token = useSelector((state: RootState) => state.cookie.token);
  const isAuthenticated = useSelector((state: RootState) => state.cookie.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.cookie.isLoading);
  
  const pathname = window.location.pathname;
  const isMenteeRoute = pathname.includes('/mentee/');
  
  let paramUserId = undefined;
  if (isMenteeRoute) {
    const parts = pathname.split('/');
    const menteeIndex = parts.indexOf('mentee');
    if (menteeIndex !== -1 && parts.length > menteeIndex + 1) {
      paramUserId = parts[menteeIndex + 1];
    }
  }

  const profileData = useSelector((state: RootState) => state.profile?.profileData);
  
  const effectiveUserId = isMenteeRoute && paramUserId ? paramUserId : cookieData?.userId;
  const effectiveEmail = isMenteeRoute && paramUserId ? profileData?.email : cookieData?.email;
  const effectiveUserName = isMenteeRoute && paramUserId ? profileData?.publicProfile?.username : cookieData?.userName;
  const effectiveProfileImage = isMenteeRoute && paramUserId ? profileData?.publicProfile?.profilePicUrl : cookieData?.profileImageUrl;

  return {
    userId: effectiveUserId,
    userEmail: effectiveEmail,
    userName: effectiveUserName,
    userMode: cookieData?.mode,
    userTheme: cookieData?.theme,
    profileImage: effectiveProfileImage,
    isProfileCreated: cookieData?.isProfileCreated, // ✅ Add this
    brokerLogin: cookieData?.brokerLogin,
    token,
    isAuthenticated,
    isLoading,
    rawData: cookieData,
  };
};