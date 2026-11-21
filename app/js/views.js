// views.js — renders the four views from the trophy data and the saved progress:
// the header stats, the checklist rows with their medal swatches and tags, the guide
// pane for the selected trophy (official description, our guide, its sources, and a
// counter for the trophies PlayStation counts), the roadmap stages with their
// progress, and the missable cards. Rendering is plain DOM, rebuilt on each change.

import { GRADE_LABEL, KIND_LABEL, gradeCounts, isMasked } from './data.js';
import { MISSABLE_NOTES, ROADMAP } from './roadmap.js';
import { counterOf } from './store.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function swatch(grade) {
  const dot = element('span', `swatch ${grade}`);
  dot.title = GRADE_LABEL[grade];
  return dot;
}

export function renderStats(root, trophies, progress) {
  const earned = progress.earned.length;
  root.querySelector('#earned-count').textContent = String(earned);
  root.querySelector('#bar-fill').style.width = `${(earned / trophies.length) * 100}%`;
  const counts = gradeCounts(trophies, progress);
  root.querySelector('#grade-line').textContent = Object.entries(counts)
    .map(([grade, c]) => `${GRADE_LABEL[grade]} ${c.earned}/${c.total}`)
    .join(' · ');
}

function rowFor(trophy, progress, selectedName, handlers) {
  const masked = isMasked(trophy, progress);
  const earned = progress.earned.includes(trophy.name);
  const row = element('button', `row${earned ? ' earned' : ''}${masked ? ' masked' : ''}${trophy.name === selectedName ? ' selected' : ''}`);
  row.type = 'button';
  row.dataset.name = trophy.name;

  const box = element('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => handlers.onToggle(trophy, box.checked));
  row.append(box);

  row.append(swatch(trophy.grade));

  const main = element('span', 'row-main');
  main.append(element('span', 'row-name', masked ? 'Hidden story trophy' : trophy.name));
  main.append(document.createElement('br'));
  main.append(
    element('span', 'row-desc', masked ? 'Spoiler hidden until earned — tick it off to reveal it.' : trophy.description),
  );
  row.append(main);

  const tags = element('span', 'row-tags');
  tags.append(element('span', `tag grade-${trophy.grade}`, GRADE_LABEL[trophy.grade]));
  if (trophy.kind !== 'platinum') tags.append(element('span', 'tag', KIND_LABEL[trophy.kind] ?? trophy.kind));
  if (trophy.missable) tags.append(element('span', 'tag flag', '⚑ Missable'));
  if (trophy.target) {
    const now = counterOf(progress, trophy.name);
    tags.append(element('span', 'tag count', `${now.toLocaleString('en-US')} / ${trophy.target.toLocaleString('en-US')} ${trophy.targetLabel}`));
  }
  row.append(tags);

  row.addEventListener('click', () => handlers.onSelect(trophy));
  return row;
}

export function renderList(root, visible, progress, selectedName, handlers) {
  const rows = root.querySelector('#rows');
  rows.replaceChildren();
  if (visible.length === 0) {
    rows.append(element('li', 'row', ''));
    rows.lastChild.textContent = 'No trophy matches those filters — loosen the search or the chips.';
    return;
  }
  for (const trophy of visible) rows.append(rowFor(trophy, progress, selectedName, handlers));
}

function counterWidget(trophy, progress, handlers) {
  const wrap = element('div');
  wrap.append(element('h3', '', `Progress — ${trophy.targetLabel}`));
  const counter = element('div', 'counter');
  const minus = element('button', '', '−');
  minus.type = 'button';
  minus.addEventListener('click', () => handlers.onCounter(trophy, counterOf(progress, trophy.name) - (trophy.step ?? 1)));
  const input = element('input');
  input.type = 'number';
  input.min = '0';
  input.value = String(counterOf(progress, trophy.name));
  input.setAttribute('aria-label', `Your count for ${trophy.name}`);
  input.addEventListener('change', () => handlers.onCounter(trophy, Number(input.value)));
  const plus = element('button', '', '+');
  plus.type = 'button';
  plus.addEventListener('click', () => handlers.onCounter(trophy, counterOf(progress, trophy.name) + (trophy.step ?? 1)));
  counter.append(minus, input, plus);
  counter.append(element('span', 'of-target', `of ${trophy.target.toLocaleString('en-US')} ${trophy.targetLabel}`));
  wrap.append(counter);
  const bar = element('div', 'counter-bar');
  const fill = element('div');
  fill.style.width = `${Math.min(100, (counterOf(progress, trophy.name) / trophy.target) * 100)}%`;
  bar.append(fill);
  wrap.append(bar);
  return wrap;
}

export function renderDetail(root, trophy, progress, handlers) {
  const pane = root.querySelector('#detail');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(element('h2', '', 'Pick a trophy'));
    pane.append(element('p', '', 'Select any row to read its guide: what to do, where the official description points, when it can be missed, and the sources each fact comes from.'));
    return;
  }
  const masked = isMasked(trophy, progress);
  const earned = progress.earned.includes(trophy.name);

  const tags = element('p');
  tags.append(element('span', `tag grade-${trophy.grade}`, GRADE_LABEL[trophy.grade]));
  tags.append(document.createTextNode(' '));
  if (trophy.kind !== 'platinum') tags.append(element('span', 'tag', KIND_LABEL[trophy.kind] ?? trophy.kind));
  if (trophy.missable) {
    tags.append(document.createTextNode(' '));
    tags.append(element('span', 'tag flag', '⚑ Missable'));
  }
  pane.append(tags);

  pane.append(element('h2', '', masked ? 'Hidden story trophy' : trophy.name));
  pane.append(
    element('p', 'official', masked ? 'This story trophy’s name and description stay covered until you earn it.' : `“${trophy.description}” — the official description`),
  );

  if (!masked) {
    pane.append(element('h3', '', 'Guide'));
    pane.append(element('p', '', trophy.guide));
    if (trophy.missable && MISSABLE_NOTES[trophy.name]) {
      const note = element('p', 'missable-note', `⚑ One-chance warning. ${MISSABLE_NOTES[trophy.name]}`);
      pane.append(note);
    }
    if (trophy.target) pane.append(counterWidget(trophy, progress, handlers));
    pane.append(element('h3', '', 'Sources'));
    pane.append(element('p', 'sources', trophy.sources));
  }

  const earnLine = element('div', 'earn-line');
  const toggle = element('button', earned ? 'undo' : '', earned ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => handlers.onToggle(trophy, !earned));
  earnLine.append(toggle);
  earnLine.append(element('span', '', earned ? 'Earned — nice one.' : 'Not yet earned.'));
  pane.append(earnLine);
}

export function renderRoadmap(root, trophies, progress, handlers) {
  const wrap = root.querySelector('#roadmap-stages');
  wrap.replaceChildren();
  ROADMAP.forEach((stage, index) => {
    const inStage = stage.trophies
      .map((name) => trophies.find((t) => t.name === name))
      .filter(Boolean);
    const done = inStage.filter((t) => progress.earned.includes(t.name)).length;
    const card = element('article', 'stage');
    const heading = element('h3');
    heading.append(element('span', 'stage-no', `Stage ${index + 1} — `));
    heading.append(document.createTextNode(stage.title));
    card.append(heading);
    card.append(element('p', 'stage-progress', `${done} of ${inStage.length} earned in this stage`));
    card.append(element('p', '', stage.blurb));
    const chips = element('div', 'chips');
    for (const trophy of inStage) {
      const chip = element('button', `chip${progress.earned.includes(trophy.name) ? ' done' : ''}`, trophy.name);
      chip.type = 'button';
      chip.addEventListener('click', () => handlers.onSelect(trophy));
      chips.append(chip);
    }
    card.append(chips);
    wrap.append(card);
  });
}

export function renderMissables(root, trophies, progress, handlers) {
  const wrap = root.querySelector('#missable-cards');
  wrap.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable)) {
    const card = element('article', 'missable-card');
    const heading = element('h3');
    heading.append(swatch(trophy.grade));
    heading.append(document.createTextNode(` ⚑ ${trophy.name}`));
    card.append(heading);
    card.append(element('p', 'official', `“${trophy.description}”`));
    card.append(element('p', '', MISSABLE_NOTES[trophy.name] ?? trophy.guide));
    const state = element('p', 'stage-progress', progress.earned.includes(trophy.name) ? 'You have this one — earned.' : 'Not yet earned — plan a save around it.');
    card.append(state);
    const open = element('button', 'chip', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => handlers.onSelect(trophy));
    card.append(open);
    wrap.append(card);
  }
}
