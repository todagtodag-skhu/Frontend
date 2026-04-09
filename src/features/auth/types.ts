export type UserRole = 'PENDING' | 'SUNGJANG' | 'TODAGI';

export interface AuthResponse {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}
