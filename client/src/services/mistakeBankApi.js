import { apiClient } from "./apiClient.js";

/**
 * Fetches the user's mistakes with optional filtering.
 *
 * @param {Object} [params]
 * @param {string} [params.sourceModule]
 * @param {string} [params.status]
 * @param {string} [params.search]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const fetchMistakes = async ({
  sourceModule,
  status,
  search,
  page = 1,
  limit = 20,
} = {}) => {
  const params = { page, limit };
  if (sourceModule && sourceModule !== "all") params.sourceModule = sourceModule;
  if (status && status !== "all") params.revisionStatus = status;
  if (search && search.trim()) params.search = search.trim();

  const response = await apiClient.get("/mistakes", { params });
  return response.data;
};

/**
 * Records a new mistake entry.
 *
 * @param {Object} payload
 */
export const recordMistake = async (payload) => {
  const response = await apiClient.post("/mistakes", payload);
  return response.data;
};

/**
 * Fetches mistake bank summary statistics.
 */
export const fetchMistakeStats = async () => {
  const response = await apiClient.get("/mistakes/stats");
  return response.data;
};

/**
 * Updates the revision status of a mistake.
 *
 * @param {string} id
 * @param {('unresolved'|'reviewing'|'mastered')} status
 */
export const updateMistakeStatus = async (id, status) => {
  const response = await apiClient.patch(`/mistakes/${id}/status`, { revisionStatus: status });
  return response.data;
};

/**
 * Updates personal revision notes for a mistake.
 *
 * @param {string} id
 * @param {string} userNotes
 */
export const updateMistakeNotes = async (id, userNotes) => {
  const response = await apiClient.patch(`/mistakes/${id}/notes`, { notes: userNotes });
  return response.data;
};

/**
 * Deletes a mistake from the bank.
 *
 * @param {string} id
 */
export const deleteMistake = async (id) => {
  const response = await apiClient.delete(`/mistakes/${id}`);
  return response.data;
};

export default {
  fetchMistakes,
  recordMistake,
  fetchMistakeStats,
  updateMistakeStatus,
  updateMistakeNotes,
  deleteMistake,
};

