export function getApiErrorMessage(error: unknown, fallback: string): string {
  const candidate = (error as any)?.response?.data?.message ?? (error as any)?.response?.data;
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }

  if (candidate && typeof candidate === 'object') {
    const values = Object.values(candidate).filter((v) => typeof v === 'string');
    if (values.length > 0) {
      return String(values[0]);
    }
  }

  const generic = (error as any)?.message;
  if (typeof generic === 'string' && generic.trim().length > 0) {
    return generic;
  }

  return fallback;
}
