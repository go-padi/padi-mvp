/**
 * Render-time helpers for curriculum copy.
 *
 * These do NOT mutate the underlying data; they produce display strings
 * only. Source data retains the " (Individual)" suffix so teacher and
 * "Both" views continue to disambiguate Group vs Individual variants.
 */

/**
 * Strip a trailing " (Individual)" suffix from a title. Only matches the
 * trailing occurrence — a leading or mid-string "(Individual)" is left alone.
 *
 * Used when rendering for role=parent, where the parent only ever sees
 * Individual chapters and the suffix becomes redundant noise.
 */
export function stripIndividualSuffix(title: string): string {
  return title.replace(/\s*\(Individual\)\s*$/, '');
}
