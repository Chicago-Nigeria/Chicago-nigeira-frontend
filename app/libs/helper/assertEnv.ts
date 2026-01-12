export const assertEnv = (variable: string, message?: string) => {
	const msg = message || `Environment variable is not defined`;

	if (!variable) {
		throw new Error(msg);
	}

	return variable;
};
