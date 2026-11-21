// data.js — loads the trophy data file and holds the guide's small vocabularies:
// the grade order the list is sorted by, and the labels for grades and kinds.
// The data itself is app/data/trophies.json: the official list (names, descriptions
// and grades as PlayStation publishes them) with this guide's own text beside it.

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABEL = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  platinum: 'Platinum',
};

export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  return response.json();
}

export function sortTrophies(trophies) {
  return [...trophies].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
}

export function gradeCounts(trophies, progress) {
  const counts = {};
  for (const grade of Object.keys(GRADE_ORDER)) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    counts[grade] = {
      earned: inGrade.filter((t) => progress.earned.includes(t.name)).length,
      total: inGrade.length,
    };
  }
  return counts;
}

export function trophyByName(trophies, name) {
  return trophies.find((t) => t.name === name) ?? null;
}

// A trophy is spoiler-masked when the reader hides spoilers, the trophy belongs to
// the story, and it has not been earned yet: its name, description and guide stay
// covered until the reader ticks it off.
export function isMasked(trophy, progress) {
  return Boolean(progress.hideSpoilers) && trophy.kind === 'story' && !progress.earned.includes(trophy.name);
}
