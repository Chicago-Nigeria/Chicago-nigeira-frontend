// Pages that require authentication to view (e.g., Settings pages)
export const authOnlyPages = [
	"/settings",
	"/settings/profile",
	"/settings/account",
];

// Restricted routes that require special authentication query parameter
export const restrictedRoutes = [
	"/verify-email",
	"/reset-password",
	"/forgot-password",
];
