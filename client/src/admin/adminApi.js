import { apiClient, ServerUrl } from "../services/apiClient.js";

export { ServerUrl };

/**
 * Fetch platform-wide analytics for admin overview.
 */
export const fetchAdminAnalytics = async () => {
  const response = await apiClient.get("/admin/analytics");
  return response.data;
};

/**
 * Fetch paginated user directory with optional search query.
 */
export const fetchAdminUsers = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }

  const response = await apiClient.get("/admin/users", { params });
  return response.data;
};

/**
 * Update a candidate's credit balance (relative addition/deduction or absolute set).
 */
export const updateUserCredits = async (userId, payload) => {
  const response = await apiClient.patch(`/admin/users/${userId}/credits`, payload);
  return response.data;
};

/**
 * Fetch paginated newsletter subscriber directory with optional search query.
 */
export const fetchAdminSubscribers = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }

  const response = await apiClient.get("/admin/newsletter", { params });
  return response.data;
};

/**
 * Remove a subscriber from the newsletter list.
 */
export const deleteAdminSubscriber = async (subscriberId) => {
  const response = await apiClient.delete(`/admin/newsletter/${subscriberId}`);
  return response.data;
};

/**
 * Update candidate details (name, isActive, isBanned).
 */
export const updateAdminUser = async (userId, payload) => {
  const response = await apiClient.patch(`/admin/users/${userId}`, payload);
  return response.data;
};

/**
 * Delete candidate user account (non-cascading).
 */
export const deleteAdminUser = async (userId) => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
};

// ===========================================================================
// INTERVIEW SESSIONS
// ===========================================================================

export const fetchAdminInterviews = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  const response = await apiClient.get("/admin/interviews", { params });
  return response.data;
};

export const fetchAdminInterviewDetail = async (interviewId) => {
  const response = await apiClient.get(`/admin/interviews/${interviewId}`);
  return response.data;
};

export const deleteAdminInterview = async (interviewId) => {
  const response = await apiClient.delete(`/admin/interviews/${interviewId}`);
  return response.data;
};

// ===========================================================================
// APTITUDE ATTEMPTS
// ===========================================================================

export const fetchAdminAptitude = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  const response = await apiClient.get("/admin/aptitude", { params });
  return response.data;
};

export const fetchAdminAptitudeDetail = async (attemptId) => {
  const response = await apiClient.get(`/admin/aptitude/${attemptId}`);
  return response.data;
};

export const deleteAdminAptitude = async (attemptId) => {
  const response = await apiClient.delete(`/admin/aptitude/${attemptId}`);
  return response.data;
};

// ===========================================================================
// GROUP DISCUSSION SESSIONS
// ===========================================================================

export const fetchAdminGD = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  const response = await apiClient.get("/admin/gd", { params });
  return response.data;
};

export const fetchAdminGDDetail = async (sessionId) => {
  const response = await apiClient.get(`/admin/gd/${sessionId}`);
  return response.data;
};

export const deleteAdminGD = async (sessionId) => {
  const response = await apiClient.delete(`/admin/gd/${sessionId}`);
  return response.data;
};

// ===========================================================================
// RESUME ANALYSES
// ===========================================================================

export const fetchAdminResume = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  const response = await apiClient.get("/admin/resume", { params });
  return response.data;
};

export const fetchAdminResumeDetail = async (analysisId) => {
  const response = await apiClient.get(`/admin/resume/${analysisId}`);
  return response.data;
};

export const deleteAdminResume = async (analysisId) => {
  const response = await apiClient.delete(`/admin/resume/${analysisId}`);
  return response.data;
};

// ===========================================================================
// PAYMENTS (AUDIT ONLY)
// ===========================================================================

export const fetchAdminPayments = async (page = 1, limit = 20, searchQuery = "") => {
  const params = { page, limit };
  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  const response = await apiClient.get("/admin/payments", { params });
  return response.data;
};

export const fetchAdminPaymentDetail = async (paymentId) => {
  const response = await apiClient.get(`/admin/payments/${paymentId}`);
  return response.data;
};
