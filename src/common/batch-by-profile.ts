/** DataLoader requires one result per input key, in exactly the input order. */
export function batchByProfile<T extends { profileId: string }>(
  profileIds: readonly string[],
  rows: readonly T[],
): T[][] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const group = groups.get(row.profileId) ?? [];
    group.push(row);
    groups.set(row.profileId, group);
  }
  return profileIds.map((id) => groups.get(id) ?? []);
}
