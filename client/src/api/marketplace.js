import API from './client';

export const marketplaceApi = {
  // Contracts & Escrow
  createContract: (data) => API.post('/api/contracts/create', data),
  getBrandContracts: () => API.get('/api/contracts/brand'),
  getStudentContracts: () => API.get('/api/contracts/student'),
  getContract: (id) => API.get(`/api/contracts/${id}`),
  createFundOrder: (contractId, milestoneNum) =>
    API.post(`/api/contracts/${contractId}/milestones/${milestoneNum}/fund-order`),
  verifyFundMilestone: (contractId, milestoneNum, paymentData) =>
    API.post(`/api/contracts/${contractId}/milestones/${milestoneNum}/fund-verify`, paymentData),
  submitMilestoneWork: (contractId, milestoneNum, data) =>
    API.post(`/api/contracts/${contractId}/milestones/${milestoneNum}/submit`, data),
  reviewMilestoneWork: (contractId, milestoneNum, data) =>
    API.post(`/api/contracts/${contractId}/milestones/${milestoneNum}/review`, data),
  getMilestoneInvoice: (contractId, milestoneNum) =>
    API.get(`/api/contracts/${contractId}/milestones/${milestoneNum}/invoice`),

  // Jobs & AI Brief
  postJob: (data) => API.post('/api/jobs/create', data),
  enhanceBriefWithAI: (roughIdea, category, targetBudget) =>
    API.post('/api/jobs/ai-enhance', { roughIdea, category, targetBudget }),
  getJobsFeed: (params) => API.get('/api/jobs/feed', { params }),

  // Proposals & Pipeline
  submitProposal: (data) => API.post('/api/proposals/submit', data),
  getJobProposals: (jobId) => API.get(`/api/jobs/${jobId}/proposals`),
  updateProposalStatus: (proposalId, status) =>
    API.patch(`/api/proposals/${proposalId}/status`, { status }),
  getStudentProposals: () => API.get('/api/student/proposals'),

  // Wallet & Payout
  getStudentWallet: () => API.get('/api/student/wallet'),
  requestPayout: (data) => API.post('/api/student/payout-request', data),

  // Profile & Verification Hub
  getStudentProfileHub: () => API.get('/api/student/profile-hub'),
  updateStudentProfileHub: (data) => API.put('/api/student/profile-hub', data),
};

export default marketplaceApi;
