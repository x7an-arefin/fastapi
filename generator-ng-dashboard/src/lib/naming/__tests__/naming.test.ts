import { describe, it, expect } from 'vitest';
import { toPascalCase, toCamelCase, toKebabCase, toPlural, buildNames } from '../index.js';

describe('naming lib', () => {
  it('should convert to PascalCase', () => {
    expect(toPascalCase('task-master')).toBe('TaskMaster');
    expect(toPascalCase('task_master')).toBe('TaskMaster');
    expect(toPascalCase('task master')).toBe('TaskMaster');
  });

  it('should convert to camelCase', () => {
    expect(toCamelCase('TaskMaster')).toBe('taskMaster');
    expect(toCamelCase('task-master')).toBe('taskMaster');
  });

  it('should convert to kebab-case', () => {
    expect(toKebabCase('TaskMaster')).toBe('task-master');
    expect(toKebabCase('taskMaster')).toBe('task-master');
    expect(toKebabCase('Task Master')).toBe('task-master');
  });

  it('should pluralize correctly', () => {
    expect(toPlural('task')).toBe('tasks');
    expect(toPlural('category')).toBe('categories');
    expect(toPlural('box')).toBe('boxes');
    expect(toPlural('match')).toBe('matches');
  });

  it('should build all names', () => {
    const names = buildNames('task');
    expect(names.name).toBe('task');
    expect(names.namePascal).toBe('Task');
    expect(names.nameCamel).toBe('task');
    expect(names.nameKebab).toBe('task');
    expect(names.namePlural).toBe('tasks');
  });
});
