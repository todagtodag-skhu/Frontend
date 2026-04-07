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
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const rawBody = await response.text();
  let parsedBody: SocialLoginResponse | ApiErrorPayload | null = null;

  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody) as SocialLoginResponse | ApiErrorPayload;
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    let errorMessage: string | null = null;

    if (parsedBody && typeof parsedBody === 'object') {
      if ('message' in parsedBody && typeof parsedBody.message === 'string') {
        errorMessage = parsedBody.message;
      } else if ('error' in parsedBody && typeof parsedBody.error === 'string') {
        errorMessage = parsedBody.error;
      }
    }

    throw new Error(
      errorMessage || DEFAULT_LOGIN_ERROR_MESSAGE[response.status] || `로그인에 실패했습니다. (${response.status})`
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
  const response = await fetch(`${getApiBaseUrl()}/users/onboarding/sungjang/invite-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || '초대코드를 발급 받는데 실패했습니다.'
    );
  }

  return body;
}

// Todagi (토닥이) - connect with invite code
export async function connectWithInviteCode(
  accessToken: string,
  inviteCode: string
): Promise<OnboardingConnectionData> {
  const response = await fetch(`${getApiBaseUrl()}/users/onboarding/todak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ inviteCode } as OnboardingConnectionRequest),
  });

  const rawBody = await response.text();
  let body: OnboardingConnectionResponse | ApiErrorPayload | null = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
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

export type { SocialLoginData, SocialLoginResponse, UserRole, OnboardingConnectionData };
