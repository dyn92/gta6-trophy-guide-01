[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/dyn92/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/dyn92/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum Atlas

An offline trophy guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI, built for make.fun's gta6-trophy-guide-01 bounty.

Open `app/index.html` in a desktop browser — or serve `app/` with any static
file server (`node serve.ts`, then http://localhost:8080) — and it works with
the network off. It holds:

- the official list whole: every trophy with its PlayStation name, description
  and grade, in `app/data/trophies.json`;
- a checklist whose progress is saved in the browser, with export and import,
  filters by kind and grade, search, progress counters for the trophies
  PlayStation counts, and a spoiler setting that masks unearned story trophies;
- a roadmap to the platinum in six stages and a missables page, both built
  from the official descriptions;
- a guide to every trophy in our own words, each citing its sources (the
  official list on Exophase; progress targets from PSNProfiles).

`main.ts` (Node 22, standard library only) hands the entry in: it copies
`app/` and `screenshots/` to the output directory and writes `dossier.json`
with the vendored `vendor/makefun-frontend.ts`, unchanged from the kit.

Unofficial fan work under the MIT License; not affiliated with Rockstar Games
or PlayStation. No Rockstar logo, artwork or game screenshots are used.
