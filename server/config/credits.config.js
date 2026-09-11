/**
 * Domain-level credit cost configuration for Group Discussion sessions.
 * Overridable via environment variable GD_CREDIT_COST.
 */
export const GD_CREDIT_COST = Number(process.env.GD_CREDIT_COST) || 150;
