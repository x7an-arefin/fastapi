import { describe, it, expect } from 'vitest';
import { normalizeFrontendSpec } from '../index.js';
import { parseOpenApi } from '../../openapi-parser/index.js';
import * as fs from 'fs';
import * as path from 'path';

describe('normalizer', () => {
  it('should normalize frontend spec correctly', () => {
    const frontendPath = path.resolve(__dirname, '../../../../sample/frontend.json');
    const openapiPath = path.resolve(__dirname, '../../../../sample/openapi.json');
    
    const frontendDoc = JSON.parse(fs.readFileSync(frontendPath, 'utf-8'));
    const openapiDoc = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
    
    const apiIR = parseOpenApi(openapiDoc);
    const frontendIR = normalizeFrontendSpec(frontendDoc, apiIR);
    
    expect(frontendIR.appName).toBeDefined();
    expect(frontendIR.auth).toBeDefined();
    expect(frontendIR.theme).toBeDefined();
    
    expect(frontendIR.modules.length).toBeGreaterThan(0);
    
    const tasksModule = frontendIR.modules.find(m => m.name === 'tasks');
    expect(tasksModule).toBeDefined();
    if (tasksModule) {
      expect(tasksModule.apiOperations).toBeDefined();
    }
  });
});
