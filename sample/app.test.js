import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onboardingChecklist } from './app.js';
test('sample returns an actionable checklist', () => { assert.equal(onboardingChecklist(' Lab ').project, 'Lab'); assert.equal(onboardingChecklist('Lab').steps.length, 4); });
test('sample rejects invalid input', () => { for (const v of ['', null, 'a'.repeat(81)]) assert.throws(() => onboardingChecklist(v), TypeError); });
