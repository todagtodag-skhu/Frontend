export function getPostLoginRoute(role: string) {
  if (role === 'PENDING') {
    return '/onboarding';
  }

  return role === 'SUNGJANG' ? '/(growth)/tree' : '/(tabs)/children';
}
