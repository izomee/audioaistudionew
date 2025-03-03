// This file is kept to prevent build errors
// It contains empty exports that were previously used for usage limiting functionality

export const ENABLE_USAGE_LIMIT = false;
export const DAILY_USAGE_LIMIT = 999;

export const hasReachedLimit = () => false;
export const incrementUsage = () => {};
export const getSettings = () => ({ enabled: false, limit: 999 });
export const resetUsage = () => {}; 