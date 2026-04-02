const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type LoginProvider = 'APPLE';
type UserRole = 'SUNGJANG' | string;

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
  role: UserRole;
}

interface SocialLoginResponse {
  success: boolean;
  data: SocialLoginData;
  message?: string;
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

    throw new Error(errorMessage || `로그인에 실패했습니다. (${response.status})`);
  }

  const result = parsedBody as SocialLoginResponse | null;

  if (!result?.success || !result.data) {
    throw new Error(result?.message || '로그인에 실패했습니다. 다시 시도해주세요.');
  }

  return result.data;
}

export async function signInWithApple(token: string) {
  return socialLogin('APPLE', { token });
}

export type { SocialLoginData, SocialLoginResponse, UserRole };
