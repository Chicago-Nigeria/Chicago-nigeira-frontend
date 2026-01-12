export const isArray = (value: unknown): value is Array<unknown> => {
  return Array.isArray(value);
};

export const isFormData = (value: unknown): value is FormData => {
  return value instanceof FormData;
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !isArray(value) &&
    !isFormData(value)
  );
};
