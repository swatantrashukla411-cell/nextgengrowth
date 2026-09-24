const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createEmailService } = require('../src/services/emailService');
const { isValidRazorpaySignature } = require('../src/services/razorpayService');

test('email service uses its provider and reports a successful send', async () => {
  const calls = [];
  const logger = { warn() {}, info() {}, error() {} };
  const service = createEmailService({
    client: { emails: { send: async (message) => { calls.push(message); return { data: { id: 'email-test' }, error: null }; } } },
    logger,
  });
  assert.deepEqual(await service.sendEmail('student@example.test', 'Welcome', '<p>Hello</p>'), { sent: true });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].to, ['student@example.test']);
  assert.equal(calls[0].subject, 'Welcome');
});

test('email service skips delivery when credentials are absent', async () => {
  let warningCount = 0;
  const service = createEmailService({ apiKey: '', logger: { warn() { warningCount += 1; }, info() {}, error() {} } });
  assert.deepEqual(await service.sendEmail('student@example.test', 'Welcome', '<p>Hello</p>'), { skipped: true });
  assert.equal(warningCount, 1);
});

test('email service surfaces provider delivery errors', async () => {
  const service = createEmailService({
    client: { emails: { send: async () => ({ error: { message: 'Rejected' } }) } },
    logger: { warn() {}, info() {}, error() {} },
  });
  await assert.rejects(service.sendEmail('student@example.test', 'Welcome', '<p>Hello</p>'), /Rejected/);
});

test('Razorpay signature check uses HMAC and rejects malformed or incorrect values', () => {
  const orderId = 'order_validation';
  const paymentId = 'pay_validation';
  const secret = 'unit-test-secret';
  const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  assert.equal(isValidRazorpaySignature(orderId, paymentId, signature, secret), true);
  assert.equal(isValidRazorpaySignature(orderId, paymentId, '0'.repeat(64), secret), false);
  assert.equal(isValidRazorpaySignature(orderId, paymentId, 'not-a-signature', secret), false);
});
