import * as SecureStore from 'expo-secure-store';

export type ChildMetadata = {
  name?: string;
  birthday?: string;
  inviteCode?: string;
};

type ChildMetadataMap = Record<string, ChildMetadata>;

const CHILD_METADATA_KEY = 'children.metadata';

async function readChildMetadataMap(): Promise<ChildMetadataMap> {
  const raw = await SecureStore.getItemAsync(CHILD_METADATA_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as ChildMetadataMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeChildMetadataMap(metadataMap: ChildMetadataMap) {
  await SecureStore.setItemAsync(CHILD_METADATA_KEY, JSON.stringify(metadataMap));
}

export async function getChildMetadata(relationId: number | string): Promise<ChildMetadata | null> {
  const metadataMap = await readChildMetadataMap();
  return metadataMap[String(relationId)] ?? null;
}

export async function saveChildMetadata(
  relationId: number | string,
  metadata: ChildMetadata
): Promise<void> {
  const key = String(relationId);
  const metadataMap = await readChildMetadataMap();
  const current = metadataMap[key] ?? {};

  metadataMap[key] = {
    ...current,
    ...metadata,
  };

  await writeChildMetadataMap(metadataMap);
}
