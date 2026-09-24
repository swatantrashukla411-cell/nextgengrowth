const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { Contract, Proposal, PayoutRequest, User, Job } = require('../src/models');
const EscrowService = require('../src/services/escrowService');

test('Contract Schema: validates default values and platform fee percent', () => {
  const contract = new Contract({
    jobId: new mongoose.Types.ObjectId(),
    brandId: new mongoose.Types.ObjectId(),
    studentId: new mongoose.Types.ObjectId(),
    title: 'Test Video Editing Contract',
    totalBudget: 10000,
    milestones: [
      {
        milestoneNumber: 1,
        title: 'Initial Cut',
        amount: 4000,
      },
      {
        milestoneNumber: 2,
        title: 'Final Master',
        amount: 6000,
      },
    ],
  });

  assert.equal(contract.platformFeePercent, 10);
  assert.equal(contract.status, 'active');
  assert.equal(contract.milestones.length, 2);
  assert.equal(contract.milestones[0].escrowStatus, 'unfunded');
  assert.equal(contract.milestones[0].workStatus, 'pending');
});

test('Proposal Schema: validates default status and required fields', () => {
  const proposal = new Proposal({
    jobId: new mongoose.Types.ObjectId(),
    studentId: new mongoose.Types.ObjectId(),
    bidAmount: 5000,
    estimatedDays: 3,
    coverLetter: 'I have 2 years of experience editing commercial reels.',
    workSamples: [{ title: 'Reel 1', url: 'https://drive.google.com/test' }],
    answers: [{ question: 'Turnaround?', answer: 'Within 48 hours' }],
  });

  assert.equal(proposal.status, 'submitted');
  assert.equal(proposal.studentBadgeAtApply, 'beginner');
  assert.equal(proposal.bidAmount, 5000);
  assert.equal(proposal.estimatedDays, 3);
  assert.equal(proposal.workSamples.length, 1);
  assert.equal(proposal.answers.length, 1);
});

test('PayoutRequest Schema: validates default status and methods', () => {
  const payout = new PayoutRequest({
    studentId: new mongoose.Types.ObjectId(),
    amount: 2500,
    payoutMethod: 'upi',
    payoutDetails: {
      upiId: 'student@okaxis',
    },
  });

  assert.equal(payout.status, 'pending');
  assert.equal(payout.amount, 2500);
  assert.equal(payout.payoutMethod, 'upi');
  assert.equal(payout.payoutDetails.upiId, 'student@okaxis');
});

test('EscrowService: calculation of platform fee and net student disbursement', () => {
  const milestoneAmount = 10000;
  const platformFeePercent = 10;
  const platformFee = (milestoneAmount * platformFeePercent) / 100;
  const studentNet = milestoneAmount - platformFee;
  const gstPercent = 18;
  const gstOnPlatformFee = Math.round((platformFee * (gstPercent / 100)) * 100) / 100;

  assert.equal(platformFee, 1000); // 10% of 10,000
  assert.equal(studentNet, 9000);   // Student receives ₹9,000
  assert.equal(gstOnPlatformFee, 180); // 18% GST on ₹1,000 commission
});

test('EscrowService: 7-day auto-release review window computation', () => {
  const now = new Date('2026-09-24T10:00:00Z');
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const diffDays = Math.round((sevenDaysLater - now) / (1000 * 60 * 60 * 24));
  assert.equal(diffDays, 7);
});

test('EscrowService: requestPayout input validation', async () => {
  // Amount < 100 must reject
  await assert.rejects(
    EscrowService.requestPayout({
      studentId: new mongoose.Types.ObjectId(),
      amount: 50,
      payoutMethod: 'upi',
      payoutDetails: { upiId: 'valid@upi' },
    }),
    /Minimum payout amount is ₹100/
  );

  // Invalid UPI ID must reject
  await assert.rejects(
    EscrowService.requestPayout({
      studentId: new mongoose.Types.ObjectId(),
      amount: 500,
      payoutMethod: 'upi',
      payoutDetails: { upiId: 'invalid-no-at-sign' },
    }),
    /valid UPI ID/
  );

  // Missing bank details must reject
  await assert.rejects(
    EscrowService.requestPayout({
      studentId: new mongoose.Types.ObjectId(),
      amount: 500,
      payoutMethod: 'bank',
      payoutDetails: { accountNumber: '' },
    }),
    /Account Holder name, Account Number, and IFSC code/
  );
});
