// main.js — boots the atlas: loads the trophy data and the saved progress, wires the
// toolbar (search, kind chips, grade and state filters, the spoiler setting, export,
// import, demo and reset), routes between the four views by the location hash, and
// re-renders on every change. Hash routes keep every view one link away:
//   #/guide, #/guide/<trophy id>, #/roadmap, #/missables, #/sources
// Opening the app with ?demo=1 seeds the demo hunt when no progress exists yet,
// which is also how the entry's screenshots were taken.

import { loadTrophyData, sortTrophies, trophyByName } from './data.js';
import { applyFilters, defaultFilters, describeFilters } from './filters.js';
import {
  exportProgress,
  importProgress,
  loadProgress,
  seedDemoProgress,
  setCounter,
  setEarned,
} from './store.js';
import { renderDetail, renderList, renderMissables, renderRoadmap, renderStats } from './views.js';

const root = document;
let trophies = [];
let progress = loadProgress();
let filters = defaultFilters();
let selectedName = null;

const handlers = {
  onToggle(trophy, on) {
    setEarned(progress, trophy.name, on);
    render();
  },
  onSelect(trophy) {
    selectedName = trophy.name;
    const view = currentView();
    if (view !== 'guide') location.hash = `#/guide/${trophy.id}`;
    else render();
  },
  onCounter(trophy, value) {
    setCounter(progress, trophy.name, value, trophy);
    render();
  },
};

function currentView() {
  const hash = location.hash.replace(/^#\//, '');
  const [view] = hash.split('/');
  return ['guide', 'roadmap', 'missables', 'sources'].includes(view) ? view : 'guide';
}

function selectedFromHash() {
  const hash = location.hash.replace(/^#\//, '');
  const [, idPart] = hash.split('/');
  if (!idPart) return null;
  const byId = trophies.find((t) => String(t.id) === idPart);
  return byId ? byId.name : null;
}

function showView(view) {
  for (const name of ['guide', 'roadmap', 'missables', 'sources']) {
    root.querySelector(`#view-${name}`).hidden = name !== view;
  }
  for (const tab of root.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

function render() {
  const view = currentView();
  showView(view);
  renderStats(root, trophies, progress);
  if (view === 'guide') {
    const visible = applyFilters(trophies, filters, progress);
    root.querySelector('#list-summary').textContent = describeFilters(filters, visible.length, trophies.length);
    const fromHash = selectedFromHash();
    if (fromHash) selectedName = fromHash;
    if (!selectedName || !trophyByName(trophies, selectedName)) {
      selectedName = visible[0]?.name ?? trophies[16]?.name ?? null;
    }
    renderList(root, visible, progress, selectedName, handlers);
    renderDetail(root, trophyByName(trophies, selectedName), progress, handlers);
    root.querySelector('#spoiler-toggle').checked = progress.hideSpoilers;
  } else if (view === 'roadmap') {
    renderRoadmap(root, trophies, progress, handlers);
  } else if (view === 'missables') {
    renderMissables(root, trophies, progress, handlers);
  }
}

function wireToolbar() {
  root.querySelector('#search').addEventListener('input', (event) => {
    filters.query = event.target.value;
    render();
  });
  for (const chip of root.querySelectorAll('#kind-chips .chip')) {
    chip.addEventListener('click', () => {
      filters.kind = chip.dataset.kind;
      for (const other of root.querySelectorAll('#kind-chips .chip')) {
        other.classList.toggle('active', other === chip);
      }
      render();
    });
  }
  root.querySelector('#grade-filter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    render();
  });
  root.querySelector('#state-filter').addEventListener('change', (event) => {
    filters.state = event.target.value;
    render();
  });
  root.querySelector('#spoiler-toggle').addEventListener('change', (event) => {
    progress.hideSpoilers = event.target.checked;
    localStorage.setItem('leonida-platinum-atlas-v1', JSON.stringify(progress));
    render();
  });
  root.querySelector('#export').addEventListener('click', () => exportProgress(progress));
  root.querySelector('#import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    progress = await importProgress(file);
    render();
  });
  root.querySelector('#demo').addEventListener('click', () => {
    progress = seedDemoProgress();
    render();
  });
  root.querySelector('#reset').addEventListener('click', () => {
    progress = { earned: [], counters: {}, hideSpoilers: false };
    localStorage.setItem('leonida-platinum-atlas-v1', JSON.stringify(progress));
    render();
  });
  for (const tab of root.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => {
      location.hash = `#/${tab.dataset.view}`;
    });
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      event.preventDefault();
      root.querySelector('#search').focus();
    }
  });
}

async function boot() {
  const data = await loadTrophyData();
  trophies = sortTrophies(data.trophies);
  if (new URLSearchParams(location.search).has('demo') && progress.earned.length === 0) {
    progress = seedDemoProgress();
  }
  if (!location.hash) location.hash = '#/guide/17';
  wireToolbar();
  render();
}

boot();
