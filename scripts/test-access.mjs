import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: (name) => imports[name] ?? {}, process: { env: {} }, Date,
  });
  return exports;
}
const { safeRedirect } = load('lib/safe-redirect.ts');
for (const input of ['//evil.example', '/\\evil.example', '/\t/evil.example', 'https://evil.example', null, new Object()]) assert.equal(safeRedirect(input), '/dashboard');
assert.equal(safeRedirect('/subjects/psychology?board=aqa#notes'), '/subjects/psychology?board=aqa#notes');
let user = { id: 'owner', email: 'owner@example.test', user_metadata: { dashcareer_role: 'founder' }, app_metadata: {} };
const { getCurrentUser } = load('app/auth-session.ts', { '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) } });
assert.equal((await getCurrentUser()).isFounder, false, 'User-editable metadata must never grant founder access');
user.app_metadata = { dashcareer_role: 'founder' };
assert.equal((await getCurrentUser()).isFounder, true);
user.app_metadata = {};
assert.equal((await getCurrentUser()).isFounder, false, 'Revocation must be read without waiting for JWT refresh');
const { membershipIsActive } = load('db/queries.ts');
assert.equal(membershipIsActive(null), false);
assert.equal(membershipIsActive(null, 'owner@example.test', true), true);
assert.equal(membershipIsActive({ status: 'active', expires_at: '2000-01-01' }), false);
assert.equal(membershipIsActive({ status: 'active', expires_at: 'invalid' }), false);
assert.equal(membershipIsActive({ status: 'refunded', expires_at: null }), false);
assert.equal(membershipIsActive({ status: 'active', expires_at: null }), true);
console.log('PASS: redirects, founder assignment/revocation, user-metadata spoofing, membership expiry and refunds');
