// store.js — the tracker's saved state: which trophies are earned, the progress counters
// for the trophies PlayStation counts, and the spoiler setting. Everything lives in
// localStorage under one key; export writes it to a JSON file and import reads one back,
// so progress can move between browsers and machines. No state ever leaves the browser
// except through that export file the reader asks for.

export const STORAGE_KEY = 'leonida-platinum-atlas-v1';

export function emptyProgress() {
  return { earned: [], counters: {}, hideSpoilers: false };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned : [],
      counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
      hideSpoilers: Boolean(parsed.hideSpoilers),
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isEarned(progress, name) {
  return progress.earned.includes(name);
}

export function setEarned(progress, name, on) {
  const set = new Set(progress.earned);
  if (on) set.add(name);
  else set.delete(name);
  progress.earned = [...set];
  saveProgress(progress);
}

export function counterOf(progress, name) {
  return Number(progress.counters[name] ?? 0);
}

export function setCounter(progress, name, value, trophy) {
  const clean = Math.max(0, Math.floor(Number(value) || 0));
  progress.counters[name] = clean;
  // Reaching a counted trophy's target earns the trophy; dropping back below un-earns it.
  if (trophy && trophy.target) setEarned(progress, name, clean >= trophy.target);
  saveProgress(progress);
}

export function exportProgress(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-atlas-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const progress = {
    earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => typeof n === 'string') : [],
    counters: parsed.counters && typeof parsed.counters === 'object' ? parsed.counters : {},
    hideSpoilers: Boolean(parsed.hideSpoilers),
  };
  saveProgress(progress);
  return progress;
}

// A sample hunt, part way through the list, so a first-time reader can see the tracker
// working — counters part way, thirteen trophies ticked — before tracking their own.
export const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'Trust',
  'Break the Bank',
  'Master of None',
  'Baited My Tackle',
  'Stick Fiddler',
  'Gunslinger',
  'Ten Pin',
  "Let's Go Bowling",
  'In The Beginning…',
  'Whip It Good',
  'Treat Yo Self',
];

export const DEMO_COUNTERS = {
  'Cunning Stunts': 137,
  'The Shootist': 31,
  'You WAiNKer!': 46,
  'One Last Thing': 22,
  'The Goodtime State': 30,
  'Actions Speak Louder': 212,
  'Dime on the Dollar': 97500,
  'Whip It Good': 100,
  'Treat Yo Self': 100000,
};

export function seedDemoProgress() {
  const progress = {
    earned: [...DEMO_EARNED],
    counters: { ...DEMO_COUNTERS },
    hideSpoilers: false,
  };
  saveProgress(progress);
  return progress;
}
