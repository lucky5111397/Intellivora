import CreditLedgerService from "../services/creditLedger.service.js";

/**
 * GET /api/user/credits/transactions
 * Returns paginated credit ledger history for the authenticated user.
 */
export const getMyCreditTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await CreditLedgerService.getUserTransactions(req.userId, {
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id/credit-history
 * Returns paginated credit ledger history for an administrative audit of a user.
 */
export const getAdminCreditTransactions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const result = await CreditLedgerService.getUserTransactions(id, {
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
