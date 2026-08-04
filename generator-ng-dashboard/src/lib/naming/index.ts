export function toPascalCase(s: string): string {
  return s.replace(/(^\w|-\w|_\w|\b\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase()).replace(/\s+/g, '');
}

export function toCamelCase(s: string): string {
  const p = toPascalCase(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

export function toKebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toSnakeCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toPlural(s: string): string {
  if (s.endsWith('y')) return s.slice(0, -1) + 'ies';
  if (/(s|x|sh|ch)$/i.test(s)) return s + 'es';
  return s + 's';
}

export function buildNames(raw: string) {
  const name = raw;
  const namePascal = toPascalCase(name);
  const nameCamel = toCamelCase(name);
  const nameKebab = toKebabCase(name);
  const nameSnake = toSnakeCase(name);
  const namePlural = toPlural(nameCamel);
  const namePluralKebab = toPlural(nameKebab);
  return { name, namePascal, nameCamel, nameKebab, nameSnake, namePlural, namePluralKebab };
}
