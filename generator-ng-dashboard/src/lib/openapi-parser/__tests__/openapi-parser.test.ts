import { describe, it, expect } from 'vitest';
import { parseOpenApi } from '../index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('openapi-parser', () => {
  it('should parse sample/openapi.json correctly', () => {
    const p = path.resolve(__dirname, '../../../../sample/openapi.json');
    const doc = JSON.parse(fs.readFileSync(p, 'utf-8'));
    
    const apiIR = parseOpenApi(doc);
    
    // Check schemas
    expect(apiIR.schemas).toBeDefined();
    
    // Check operations
    expect(apiIR.operations).toBeDefined();
    
    const opIds = Object.keys(apiIR.operations);
    expect(opIds.length).toBeGreaterThan(0);
    
    // Extracted tags
    expect(apiIR.tags.length).toBeGreaterThan(0);
    expect(apiIR.tags).toContain('tasks');
  });
});
