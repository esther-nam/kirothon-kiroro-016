// Intl.DateTimeFormat construction is expensive. One instance is kept per
// (locale, timeZone, options) combination (design 3.2, 3.10).

const cache = new Map<string, Intl.DateTimeFormat>();

export function getFormatter(
  locale: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${timeZone}|${JSON.stringify(options, Object.keys(options).sort())}`;
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone });
    cache.set(key, formatter);
  }
  return formatter;
}

export function formatterCacheSize(): number {
  return cache.size;
}

export function clearFormatterCache(): void {
  cache.clear();
}
