// filters.js — the checklist's filter state and the rule that applies it:
// search text over names, descriptions and guides; a kind chip (with "missable"
// as its own chip over the missable flag); a grade select; and an earned state
// select. Pure functions over the trophy list, so the views stay thin.

export function defaultFilters() {
  return { query: '', kind: 'all', grade: 'all', state: 'all' };
}

export function matchesQuery(trophy, query) {
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return Boolean(trophy.missable);
  return trophy.kind === kind;
}

export function matchesState(trophy, state, progress) {
  if (state === 'all') return true;
  const earned = progress.earned.includes(trophy.name);
  return state === 'earned' ? earned : !earned;
}

export function applyFilters(trophies, filters, progress) {
  return trophies.filter(
    (trophy) =>
      matchesQuery(trophy, filters.query) &&
      matchesKind(trophy, filters.kind) &&
      (filters.grade === 'all' || trophy.grade === filters.grade) &&
      matchesState(trophy, filters.state, progress),
  );
}

export function describeFilters(filters, shown, total) {
  const parts = [`Showing ${shown} of ${total} trophies`];
  if (filters.kind === 'missable') parts.push('missable ones only');
  else if (filters.kind !== 'all') parts.push(`${filters.kind} only`);
  if (filters.grade !== 'all') parts.push(`${filters.grade} only`);
  if (filters.state === 'earned') parts.push('earned only');
  if (filters.state === 'open') parts.push('not yet earned');
  if (filters.query) parts.push(`matching “${filters.query}”`);
  return `${parts.join(' · ')}.`;
}
