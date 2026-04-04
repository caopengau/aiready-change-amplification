import { describe, it, expect, vi } from 'vitest';
import { CHANGE_AMPLIFICATION_PROVIDER } from '../provider';
import { validateSpokeOutput } from '@aiready/core';

// Mock core functions to avoid actual FS access
vi.mock('@aiready/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aiready/core')>();
  return {
    ...actual,
    scanFiles: vi.fn().mockResolvedValue(['file1.ts']),
    readFileContent: vi.fn().mockImplementation((file) => {
      if (file === 'file1.ts')
        return 'import { x } from "./module"; export const y = x + 1;';
      return '';
    }),
  };
});

describe('Change Amplification Contract Validation', () => {
  it('should produce output matching the SpokeOutput contract', async () => {
    const options = {
      rootDir: './test',
    };

    const output = await CHANGE_AMPLIFICATION_PROVIDER.analyze(options);

    // 1. Structural Validation
    const validation = validateSpokeOutput('change-amplification', output);
    if (!validation.valid) {
      console.error('Contract Validation Errors:', validation.errors);
    }
    expect(validation.valid).toBe(true);

    // 2. Scoring Validation
    const score = CHANGE_AMPLIFICATION_PROVIDER.score(output, options);
    expect(score).toBeDefined();
    expect(typeof score.score).toBe('number');
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });
});
