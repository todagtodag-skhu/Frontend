import axios from 'axios';
import { clearAuthSession, getAuthSession, saveAuthSession } from '@/features/auth/session';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type LoginProvider = 'APPLE';
type UserRole = 'PENDING' | 'SUNGJANG' | 'TODAGI' | string;

interface ApiErrorPayload {
  message?: string;
  error?: string;
}

interface SocialLoginRequest {
  token: string;
}

interface SocialLoginData {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

interface SocialLoginResponse {
  success: boolean;
  data: SocialLoginData;
  message?: string;
}

const DEFAULT_LOGIN_ERROR_MESSAGE: Record<number, string> = {
  400: '로그인 요청이 올바르지 않습니다.',
  401: '소셜 로그인 토큰이 유효하지 않습니다.',
  502: '소셜 로그인 서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

function parseJsonMaybe(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function extractApiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  if ('error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  return null;
}

function isSocialLoginData(value: unknown): value is SocialLoginData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SocialLoginData>;

  return (
    typeof candidate.isNewUser === 'boolean' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.role === 'string'
  );
}

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  return API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
}

async function socialLogin(provider: LoginProvider, payload: SocialLoginRequest) {
  const response = await axios.post(`${getApiBaseUrl()}/api/auth/login/${provider}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  });

  const parsedBody = parseJsonMaybe(response.data) as SocialLoginResponse | ApiErrorPayload | null;

  if (response.status < 200 || response.status >= 300) {
    let errorMessage: string | null = null;

    if (parsedBody && typeof parsedBody === 'object') {
      if ('message' in parsedBody && typeof parsedBody.message === 'string') {
        errorMessage = parsedBody.message;
      } else if ('error' in parsedBody && typeof parsedBody.error === 'string') {
        errorMessage = parsedBody.error;
      }
    }

    throw new Error(
      errorMessage ||
        DEFAULT_LOGIN_ERROR_MESSAGE[response.status] ||
        `로그인에 실패했습니다. (${response.status})`
    );
  }

  if (isSocialLoginData(parsedBody)) {
    return parsedBody;
  }

  const result = parsedBody as SocialLoginResponse | null;

  if (result?.success && isSocialLoginData(result.data)) {
    return result.data;
  }

  throw new Error(result?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
}

export async function signInWithApple(token: string) {
  return socialLogin('APPLE', { token });
}

// Onboarding API types
interface OnboardingInviteCodeResponse {
  inviteCode: string;
}

interface OnboardingConnectionRequest {
  inviteCode: string;
}

interface OnboardingConnectionData {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

interface OnboardingConnectionResponse {
  success: boolean;
  data: OnboardingConnectionData;
  message?: string;
}

function isOnboardingConnectionData(value: unknown): value is OnboardingConnectionData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<OnboardingConnectionData>;

  return (
    typeof candidate.isNewUser === 'boolean' &&
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.role === 'string'
  );
}

// Growth (성장이) - request invite code
export async function requestInviteCode(accessToken: string): Promise<OnboardingInviteCodeResponse> {
  const response = await axios.post(`${getApiBaseUrl()}/users/onboarding/sungjang/invite-code`, null, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    validateStatus: () => true,
  });

  const body = parseJsonMaybe(response.data) as OnboardingInviteCodeResponse | ApiErrorPayload | null;

  if (response.status < 200 || response.status >= 300) {
    throw new Error(extractApiErrorMessage(body) || '초대코드를 발급 받는데 실패했습니다.');
  }

  return body as OnboardingInviteCodeResponse;
}

// Todagi (토닥이) - connect with invite code
export async function connectWithInviteCode(
  accessToken: string,
  inviteCode: string
): Promise<OnboardingConnectionData> {
  const response = await axios.post(
    `${getApiBaseUrl()}/users/onboarding/todak`,
    { inviteCode } as OnboardingConnectionRequest,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      validateStatus: () => true,
    }
  );

  const body = parseJsonMaybe(response.data) as OnboardingConnectionResponse | ApiErrorPayload | null;

  if (response.status < 200 || response.status >= 300) {
    const errorMessage = 
      (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string')
        ? body.message
      : (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string')
        ? body.error
        : '초대코드 연결에 실패했습니다.';

    throw new Error(errorMessage);
  }

  if (isOnboardingConnectionData(body)) {
    return body;
  }

  const result = body as OnboardingConnectionResponse | null;

  if (result?.success && isOnboardingConnectionData(result.data)) {
    return result.data;
  }

  throw new Error(result?.message || '초대코드 연결에 실패했습니다.');
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function refreshAccessToken(): Promise<string> {
  const session = await getAuthSession();

  if (!session?.refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }

  const response = await axios.post(
    `${getApiBaseUrl()}/auth/refresh`,
    { refreshToken: session.refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`토큰 재발급에 실패했습니다. (${response.status})`);
  }

  const data = parseJsonMaybe(response.data) as RefreshResponse | null;

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('토큰 재발급 응답이 올바르지 않습니다.');
  }

  await saveAuthSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    role: session.role,
  });

  return data.accessToken;
}

export async function logout(): Promise<void> {
  const session = await getAuthSession();

  try {
    if (session?.accessToken) {
      await axios.post(`${getApiBaseUrl()}/users/logout`, null, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        validateStatus: () => true,
      });
    }
  } finally {
    await clearAuthSession();
  }
}

export async function withdraw(): Promise<void> {
  const session = await getAuthSession();

  try {
    if (session?.accessToken) {
      await axios.delete(`${getApiBaseUrl()}/users/withdraw`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        validateStatus: () => true,
      });
    }
  } finally {
    await clearAuthSession();
  }
}

export type { SocialLoginData, SocialLoginResponse, UserRole, OnboardingConnectionData };
