const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getBrowserOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://admission.met.edu';
};

export const PUBLIC_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_PUBLIC_BASE_URL || getBrowserOrigin()
);

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || `${PUBLIC_BASE_URL}/api`
);

export const normalizeAssetPath = (assetPath = '') =>
  typeof assetPath === 'string' ? assetPath.replace(/\\/g, '/').replace(/^\/+/, '') : '';

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalizedPath}`;
};

export const buildAssetUrl = (assetPath = '') => {
  const normalizedPath = normalizeAssetPath(assetPath);
  return normalizedPath ? `${PUBLIC_BASE_URL}/${normalizedPath}` : '';
};

export const getAcademicYearLabel = (referenceDate = new Date(), startMonthIndex = 0) => {
  const parsedDate = new Date(referenceDate);
  const effectiveDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const startYear =
    effectiveDate.getMonth() >= startMonthIndex
      ? effectiveDate.getFullYear()
      : effectiveDate.getFullYear() - 1;

  return `${startYear}-${startYear + 1}`;
};
