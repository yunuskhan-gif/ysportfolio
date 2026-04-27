import { jwtDecode } from 'jwt-decode';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  userName: string;
  exp: number;
  name: string; 
  iat: number;
  mode?: string;
  profileImageUrl?: string | null; 
  theme?: string;
  isProfileCreated?: boolean;  // ✅ Add this
  brokerLogin?: Record<string, boolean>;
}

export const parseAuthToken = (token: string): AuthTokenPayload | null => {
  try {
    return jwtDecode<AuthTokenPayload>(token);
  } catch {
    return null;
  }
};