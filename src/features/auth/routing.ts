export function getPostLoginRoute(role: string) {
  return role === 'SUNGJANG' ? '/(growth)/tree' : '/(tabs)/children';
}
