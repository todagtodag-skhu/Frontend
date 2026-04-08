import { saveAuthSession } from '@/features/auth/session';
import { ApiError, assertOkStatus, extractApiErrorMessage, getApiClient, parseJsonMaybe } from '@/lib/apiClient';

export interface RelationItem {
  relationId: number;
  sungjangName?: string;
  sungjangBirthday?: string;
  inviteCode?: string;
}

export interface RelationListResponse {
  relations: RelationItem[];
}

export interface InviteCodeResponse {
  inviteCode: string;
}

export interface ConnectTodakRequest {
  code: string;
}

export interface ConnectTodakResponse {
  relationId: number;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface UpdateSungjangInfoRequest {
  sungjangName: string;
  sungjangBirthday: string;
}

const GET_RELATIONS_ERROR: Record<number, string> = {
  403: '토닥이 계정만 관계 목록을 조회할 수 있습니다.',
  404: '유저를 찾을 수 없습니다.',
};

const CREATE_INVITE_CODE_ERROR: Record<number, string> = {
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: 'PENDING 유저는 /users/onboarding/sungjang/invite-code를 사용해 주세요.',
  404: '연결된 관계를 찾을 수 없습니다.',
};

const CONNECT_TODAK_ERROR: Record<number, string> = {
  400: '유효하지 않은 초대코드입니다.',
  403: '토닥이 계정만 추가 연결이 가능합니다.',
  404: '유저를 찾을 수 없습니다.',
  409: '이미 연결된 관계가 존재합니다.',
};

const UPDATE_SUNGJANG_INFO_ERROR: Record<number, string> = {
  400: '요청 데이터가 올바르지 않습니다.',
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: '토닥이 계정만 성장이 정보를 수정할 수 있습니다.',
  404: '해당 관계를 찾을 수 없습니다.',
};

function buildErrorMessage(
  body: unknown,
  status: number,
  errorMap: Record<number, string>,
  defaultMessage: string
): string {
  return (
    extractApiErrorMessage(body) ??
    errorMap[status] ??
    `${defaultMessage} (${status})`
  );
}
export async function getRelations(): Promise<RelationListResponse> {
  const response = await getApiClient().get('/relation/todak');
  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(
      buildErrorMessage(body, response.status, GET_RELATIONS_ERROR, '관계 목록 조회에 실패했습니다.'),
      response.status
    );
  }

  const data = body as RelationListResponse | null;
  if (!data?.relations || !Array.isArray(data.relations)) {
    throw new ApiError('관계 목록 응답이 올바르지 않습니다.', 0);
  }

  console.log('[getRelations] relations:', JSON.stringify(data.relations));
  return data;
}
export async function createRelationInviteCode(): Promise<InviteCodeResponse> {
  const response = await getApiClient().post('/relation/invite-code');
  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(
      buildErrorMessage(body, response.status, CREATE_INVITE_CODE_ERROR, '초대코드 생성에 실패했습니다.'),
      response.status
    );
  }

  const data = body as InviteCodeResponse | null;
  if (!data?.inviteCode) {
    throw new ApiError('초대코드 응답이 올바르지 않습니다.', 0);
  }

  return data;
}
export async function connectTodak(code: string): Promise<ConnectTodakResponse> {
  const response = await getApiClient().post('/relation/connect/todak', { code } satisfies ConnectTodakRequest);
  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(
      buildErrorMessage(body, response.status, CONNECT_TODAK_ERROR, '연결에 실패했습니다.'),
      response.status
    );
  }

  const data = body as ConnectTodakResponse | null;
  if (data?.relationId == null) {
    throw new ApiError('연결 응답이 올바르지 않습니다.', 0);
  }

  if (data.accessToken && data.refreshToken && data.role) {
    await saveAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
    });
  }

  return data;
}
export async function updateSungjangInfo(
  relationId: number | string,
  input: UpdateSungjangInfoRequest
): Promise<void> {
  const response = await getApiClient().post(
    `/relation/${relationId}/sungjang-info`,
    input satisfies UpdateSungjangInfoRequest
  );
  const body = parseJsonMaybe(response.data);

  if (response.status < 200 || response.status >= 300) {
    throw new ApiError(
      buildErrorMessage(body, response.status, UPDATE_SUNGJANG_INFO_ERROR, '성장이 정보 수정에 실패했습니다.'),
      response.status
    );
  }
}
