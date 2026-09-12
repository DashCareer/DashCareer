import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';

const code = ts.transpileModule(readFileSync('supabase/functions/gumroad-webhook/index.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function receiver({ secret = 'test-secret', linked = true, failMembership = false } = {}) {
  let handle;
  const writes = [];
  const db = { from(table) {
    return {
      select() { return this; }, eq() { return this; },
      async maybeSingle() { return { data: linked ? { user_id: 'fixture-user', email: 'student@example.test' } : null }; },
      async upsert(row) { writes.push({ table, row }); return { error: table === 'memberships' && failMembership ? { message: 'database failure' } : null }; },
      update() { return this; },
    };
  } };
  vm.runInNewContext(code, { exports: {}, require: (name) => name.includes('supabase-js') ? { createClient: () => db } : {}, Deno: { env: { get: (name) => name === 'GUMROAD_WEBHOOK_SECRET' ? secret : 'fixture' }, serve: (fn) => { handle = fn; } }, URL, URLSearchParams, Response, TextEncoder, crypto: webcrypto, Date });
  return { writes, async send(overrides = {}, key = 'test-secret') {
    const form = new FormData();
    for (const [k, v] of Object.entries({ email: 'student@example.test', product_permalink: 'irrlrl', sale_id: 'fixture-sale', dc_checkout: 'fixture-checkout', ...overrides })) if (v !== null) form.set(k, v);
    return handle(new Request(`https://fixture.test/?secret=${key}`, { method: 'POST', body: form }));
  } };
}
let checks = 0;
for (const options of [{}, { secret: '' }]) {
  const r = receiver(options); assert.equal((await r.send({}, options.secret === '' ? '' : 'wrong')).status, 401); assert.equal(r.writes.length, 0); checks++;
}
for (const flag of ['test', 'is_test']) {
  const r = receiver(); const response = await r.send({ [flag]: 'true' }); assert.equal((await response.json()).test, true); assert.equal(r.writes.length, 0); checks++;
}
for (const product of ['another-monthly-product', 'xirrlrlx', '']) {
  const r = receiver(); await r.send({ product_permalink: product, product_name: 'Monthly annual membership' }); assert.equal(r.writes.length, 0); checks++;
}
const missing = receiver(); assert.equal((await missing.send({ sale_id: null })).status, 400); assert.equal(missing.writes.length, 0); checks++;
for (const [product, plan] of [['irrlrl', 'monthly'], ['atypnn', 'annual']]) {
  const r = receiver(); assert.equal((await (await r.send({ product_permalink: product })).json()).linked, true); const row = r.writes.find(w => w.table === 'memberships').row; assert.equal(row.plan, plan); assert.equal(row.user_id, 'fixture-user'); assert.equal(row.status, 'active'); checks++;
}
const unlinked = receiver({ linked: false }); assert.equal((await (await unlinked.send()).json()).linked, false); assert.equal(unlinked.writes.some(w => w.table === 'memberships'), false); checks++;
const refunded = receiver(); await refunded.send({ refunded: 'true' }); assert.equal(refunded.writes.find(w => w.table === 'memberships').row.status, 'inactive'); checks++;
const failure = receiver({ failMembership: true }); assert.equal((await failure.send()).status, 500); checks++;
console.log(`PASS: ${checks} actual webhook handler scenarios using an isolated fake database; no charges or live membership writes`);
