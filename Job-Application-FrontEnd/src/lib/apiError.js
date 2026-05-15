export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors.join(", ");
  if (data?.message) return data.message;
  return fallback;
}
