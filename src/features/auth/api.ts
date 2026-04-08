import axios from 'axios';
import { clearAuthSession, getAuthSession, saveAuthSession } from '@/features/auth/session';
import {
  ApiError,
  extractApiErrorMessage,
  getApiBaseUrl,
  parseJsonMaybe,
} from '@/lib/apiClient';

export type LoginProvider = 'APPLE';
export type UserRole = 'PENDING' | 'SUNGJANG' | 'TODAGI' | string;

// ─── 공통 응답 타입 ────────────────────────────────────────────────────────────

export interface AuthTokenData {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

// ─── 소셜 로그인 ───────────────────────────────────────────────────────────────

interface SocialLoginRequest {
  token: string;
}

const SOCIAL_LOGIN_ERROR: Record<number, string> = {
  400: '로그인 요청이 올바르지 않습니다.',
  401: '소셜 로그인 토큰이 유효하지 않습니다.',
  502: '소셜 로그인 서버와 통신하지 못했습니다. 잠시 후 다시 시도해주세요.',
};

function isAuthTokenData(value: unknown): value is AuthTokenData {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<AuthTokenData>;
  return (
    typeof c.isNewUser === 'boolean' &&
    typeof c.accessToken === 'string' &&
    typeof c.refreshToken === 'string' &&
    typeof c.role === 'string'
  );
}

async function socialLogin(provider: LoginProvider, payload: SocialLoginRequest) {
  const response = await axios.post(
    `${getApiBaseUrl()}/api/auth/login/${provider}`,
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    }
  );

  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    const serverMessage = extractApiErrorMessage(body);
    const fallback =
      SOCIAL_LOGIN_ERROR[response.status] ?? `로그인에 실패했습니다. (${response.status})`;
    throw new ApiError(serverMessage ?? fallback, response.status);
  }

  if (isAuthTokenData(body)) {
    return body;
  }

  const wrapped = body as { success?: boolean; data?: unknown; message?: string } | null;
  if (wrapped?.success && isAuthTokenData(wrapped.data)) {
    return wrapped.data;
  }

  throw new ApiError(wrapped?.message ?? '로그인에 실패했습니다. 다시 시도해주세요.', 0);
}

export async function signInWithApple(token: string): Promise<AuthTokenData> {
  return socialLogin('APPLE', { token });
}

// ─── 토큰 재발급 ───────────────────────────────────────────────────────────────

const REFRESH_ERROR: Record<number, string> = {
  400: '토큰 재발급 요청이 올바르지 않습니다.',
  401: '리프레시 토큰이 만료됐거나 유효하지 않습니다. 다시 로그인해 주세요.',
};

export async function refreshAccessToken(): Promise<string> {
  const session = await getAuthSession();

  if (!session?.refreshToken) {
    await clearAuthSession();
    throw new ApiError('리프레시 토큰이 없습니다.', 401);
  }

  const response = await axios.post(
    `${getApiBaseUrl()}/auth/refresh`,
    { refreshToken: session.refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    }
  );

  const body = parseJsonMaybe(response.data) as Partial<AuthTokenData> | null;

  if (response.status < 200 || response.status >= 300) {
    await clearAuthSession();
    const fallback =
      REFRESH_ERROR[response.status] ?? `토큰 재발급에 실패했습니다. (${response.status})`;
    const serverMessage = extractApiErrorMessage(body);
    throw new ApiError(serverMessage ?? fallback, response.status);
  }

  if (!body?.accessToken || !body?.refreshToken) {
    await clearAuthSession();
    throw new ApiError('토큰 재발급 응답이 올바르지 않습니다.', 0);
  }

  await saveAuthSession({
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    role: body.role ?? session.role,
  });

  return body.accessToken;
}

// ─── 로그아웃 ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const session = await getAuthSession();

  try {
    if (session?.accessToken && session?.refreshToken) {
      await axios.post(
        `${getApiBaseUrl()}/auth/logout`,
        { refreshToken: session.refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          validateStatus: () => true,
        }
      );
      // 서버 에러가 있어도 로컬 세션은 반드시 삭제
    }
  } finally {
    await clearAuthSession();
  }
}

// ─── 회원 탈퇴 ─────────────────────────────────────────────────────────────────

const WITHDRAW_ERROR: Record<number, string> = {
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: '권한이 없습니다.',
  404: '유저를 찾을 수 없습니다.',
};

export async function withdraw(): Promise<void> {
  const session = await getAuthSession();

  if (!session?.accessToken) {
    throw new ApiError('인증 정보가 없습니다. 다시 로그인해 주세요.', 401);
  }

  const response = await axios.delete(`${getApiBaseUrl()}/users/withdraw`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    validateStatus: () => true,
  });

  console.log('[withdraw] status:', response.status, 'data:', response.data);

  if (response.status < 200 || response.status >= 300) {
    const body = parseJsonMaybe(response.data);
    const serverMessage = extractApiErrorMessage(body);
    const fallback =
      WITHDRAW_ERROR[response.status] ?? `회원 탈퇴에 실패했습니다. (${response.status})`;
    throw new ApiError(serverMessage ?? fallback, response.status);
  }

  // 성공 시에만 세션 삭제
  await clearAuthSession();
}

// ─── 온보딩: 성장이 초대코드 생성 ────────────────────────────────────────────

export interface InviteCodeResponse {
  inviteCode: string;
}

const SUNGJANG_INVITE_ERROR: Record<number, string> = {
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: '온보딩 권한이 없습니다. PENDING 계정만 사용할 수 있습니다.',
};

export async function requestSungjangInviteCode(accessToken: string): Promise<InviteCodeResponse> {
  const response = await axios.post(
    `${getApiBaseUrl()}/users/onboarding/sungjang/invite-code`,
    null,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      validateStatus: () => true,
    }
  );

  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    const serverMessage = extractApiErrorMessage(body);
    const fallback =
      SUNGJANG_INVITE_ERROR[response.status] ?? `초대코드 발급에 실패했습니다. (${response.status})`;
    throw new ApiError(serverMessage ?? fallback, response.status);
  }

  const result = body as InviteCodeResponse | null;
  if (!result?.inviteCode) {
    throw new ApiError('초대코드 응답이 올바르지 않습니다.', 0);
  }

  return result;
}

// keep backward-compatible alias
export const requestInviteCode = requestSungjangInviteCode;

// ─── 온보딩: 토닥이 초대코드로 연결 ─────────────────────────────────────────

const TODAK_ONBOARDING_ERROR: Record<number, string> = {
  400: '유효하지 않은 초대코드입니다.',
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: '온보딩 권한이 없습니다. PENDING 계정만 사용할 수 있습니다.',
  404: '해당 초대코드에 연결된 유저를 찾을 수 없습니다.',
};

export async function connectWithInviteCode(
  accessToken: string,
  inviteCode: string
): Promise<AuthTokenData> {
  const response = await axios.post(
    `${getApiBaseUrl()}/users/onboarding/todak`,
    { inviteCode },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      validateStatus: () => true,
    }
  );

  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    const serverMessage = extractApiErrorMessage(body);
    const fallback =
      TODAK_ONBOARDING_ERROR[response.status] ??
      `초대코드 연결에 실패했습니다. (${response.status})`;
    throw new ApiError(serverMessage ?? fallback, response.status);
  }

  if (isAuthTokenData(body)) {
    return body;
  }

  const wrapped = body as { success?: boolean; data?: unknown; message?: string } | null;
  if (wrapped?.success && isAuthTokenData(wrapped.data)) {
    return wrapped.data;
  }

  throw new ApiError(wrapped?.message ?? '초대코드 연결에 실패했습니다.', 0);
}

export type { SocialLoginRequest };
export type { ApiError };
