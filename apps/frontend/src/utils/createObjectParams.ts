export default function createObjectParams<T extends object>(
  query: T,
): Record<string, string> {
  const params: Record<string, string> = Object.fromEntries(
    Object.entries(query)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)]),
  );

  return params;
}
