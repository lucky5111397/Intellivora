import axios from "axios";

export const ServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

/**
 * Fetch platform-wide analytics for admin overview.
 */
export const fetchAdminAnalytics = async () => {
  const response = await axios.get(`${ServerUrl}/api/admin/analytics`, {
    withCredentials: true,
  });
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

  const response = await axios.get(`${ServerUrl}/api/admin/users`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

/**
 * Update a candidate's credit balance (relative addition/deduction or absolute set).
 */
export const updateUserCredits = async (userId, payload) => {
  const response = await axios.patch(
    `${ServerUrl}/api/admin/users/${userId}/credits`,
    payload,
    {
      withCredentials: true,
    }
  );
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

  const response = await axios.get(`${ServerUrl}/api/admin/newsletter`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

/**
 * Remove a subscriber from the newsletter list.
 */
export const deleteAdminSubscriber = async (subscriberId) => {
  const response = await axios.delete(
    `${ServerUrl}/api/admin/newsletter/${subscriberId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Update candidate details (name, isActive, isBanned).
 */
export const updateAdminUser = async (userId, payload) => {
  const response = await axios.patch(
    `${ServerUrl}/api/admin/users/${userId}`,
    payload,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Delete candidate user account (non-cascading).
 */
export const deleteAdminUser = async (userId) => {
  const response = await axios.delete(
    `${ServerUrl}/api/admin/users/${userId}`,
    {
      withCredentials: true,
    }
  );
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
  const response = await axios.get(`${ServerUrl}/api/admin/interviews`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const fetchAdminInterviewDetail = async (interviewId) => {
  const response = await axios.get(`${ServerUrl}/api/admin/interviews/${interviewId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteAdminInterview = async (interviewId) => {
  const response = await axios.delete(`${ServerUrl}/api/admin/interviews/${interviewId}`, {
    withCredentials: true,
  });
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
  const response = await axios.get(`${ServerUrl}/api/admin/aptitude`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const fetchAdminAptitudeDetail = async (attemptId) => {
  const response = await axios.get(`${ServerUrl}/api/admin/aptitude/${attemptId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteAdminAptitude = async (attemptId) => {
  const response = await axios.delete(`${ServerUrl}/api/admin/aptitude/${attemptId}`, {
    withCredentials: true,
  });
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
  const response = await axios.get(`${ServerUrl}/api/admin/gd`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const fetchAdminGDDetail = async (sessionId) => {
  const response = await axios.get(`${ServerUrl}/api/admin/gd/${sessionId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteAdminGD = async (sessionId) => {
  const response = await axios.delete(`${ServerUrl}/api/admin/gd/${sessionId}`, {
    withCredentials: true,
  });
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
  const response = await axios.get(`${ServerUrl}/api/admin/resume`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const fetchAdminResumeDetail = async (analysisId) => {
  const response = await axios.get(`${ServerUrl}/api/admin/resume/${analysisId}`, {
    withCredentials: true,
  });
  return response.data;
};

export const deleteAdminResume = async (analysisId) => {
  const response = await axios.delete(`${ServerUrl}/api/admin/resume/${analysisId}`, {
    withCredentials: true,
  });
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
  const response = await axios.get(`${ServerUrl}/api/admin/payments`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const fetchAdminPaymentDetail = async (paymentId) => {
  const response = await axios.get(`${ServerUrl}/api/admin/payments/${paymentId}`, {
    withCredentials: true,
  });
  return response.data;
};

