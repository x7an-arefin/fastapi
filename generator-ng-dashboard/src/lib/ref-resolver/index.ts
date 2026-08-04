export function resolveRef(pointer: string, document: Record<string, unknown>): unknown {
  if (!pointer.startsWith('#/')) {
    throw new Error(`Only local JSON pointers starting with '#/' are supported. Got: ${pointer}`);
  }
  const parts = pointer.slice(2).split('/');
  let current: unknown = document;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      throw new Error(`Could not resolve JSON pointer: ${pointer}`);
    }
    const decodedPart = part.replace(/~1/g, '/').replace(/~0/g, '~');
    current = (current as Record<string, unknown>)[decodedPart];
  }
  if (current === undefined) {
    throw new Error(`Could not resolve JSON pointer: ${pointer}`);
  }
  return current;
}
