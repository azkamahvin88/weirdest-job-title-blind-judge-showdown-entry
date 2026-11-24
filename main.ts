// Weirdest Job Title: Blind Judge Showdown — make.fun entry (program/v1).
//
// The entry is exactly ONE job title, at most 60 characters, and nothing
// else. A judge model reads two titles at a time and picks the weirder,
// funnier one. The brief weighs, most important first:
//   1. it IS a weird job title (a few words naming an odd job);
//   2. it is stranger than ordinary work — a job nobody has heard of, or
//      one with a gloriously odd twist;
//   3. it is funny, with a twist that lands on the first read;
//   4. it sounds like a real job, specific enough to picture the person
//      doing it;
//   5. it reads instantly, short enough to take in at a glance.
// Length for its own sake does not count.
//
// This program scores a shortlist of candidates against that brief in
// its own order and writes the winner — the title alone, no trailing
// newline — to /output/entry.txt (or $OUTPUT_DIR/entry.txt for local
// testing; the grader runs with /output).
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  title: string;
  weird: number; // 1-5: is a weird job title, stranger than ordinary work
  funny: number; // 1-5: the twist lands on the first read
  real: number; // 1-5: sounds like a real job, specific enough to picture
  instant: number; // 1-5: reads instantly, short enough for one glance
};

// The shortlist, brainstormed against the brief. Every title is a
// real-sounding job with ONE specific, funny twist — never generic
// oddity, never word salad. Each was checked to be at most 60 chars.
//
// Why the winner wins, in the brief's order:
//   - Weird: a whole officer post exists for lost socks — a job nobody
//     has heard of, and nobody asked for.
//   - Stranger: "Left Foot Division" is the twist. It implies a mirror
//     division for right feet, a filing system, a budget. The absurdity
//     is bureaucratic, which makes it stranger than a random odd word.
//   - Funny: the punchline lands on the first read — the moment you hit
//     "Left Foot Division" you picture the desk, the forms, the other
//     division down the hall.
//   - Real: "Chief Officer" + "Division" reads like a genuine
//     civil-service title; lost socks are universal, so the person doing
//     this job is instantly pictureable.
//   - Instant: 47 characters, one glance, no word wasted.
// Runners-up lose on the twist: the whisperer, the mourner and the sheep
// counter are all funny, but none of them has a second beat as sharp as
// "Left Foot Division" — their twist is the job itself, and once you
// have read the job there is nothing left to discover.
const CANDIDATES: Candidate[] = [
  { title: "Chief Officer of Lost Socks, Left Foot Division", weird: 5, funny: 5, real: 5, instant: 5 },
  { title: "Senior Whisperer for Vending Machines That Eat Coins", weird: 4, funny: 4, real: 4, instant: 4 },
  { title: "Professional Mourner for Funerals of Strangers", weird: 4, funny: 3, real: 5, instant: 5 },
  { title: "Certified Smeller of New Car Smell for Used Cars", weird: 4, funny: 4, real: 4, instant: 4 },
  { title: "Lead Negotiator Between Cats and Their Owners", weird: 3, funny: 4, real: 4, instant: 5 },
  { title: "Official Counter of Sheep for Insomniacs, Night Shift", weird: 4, funny: 4, real: 4, instant: 4 },
  { title: "Director of Apologies for Weather Forecasters", weird: 3, funny: 3, real: 4, instant: 5 },
  { title: "Senior Listener for Houseplants With Anxiety", weird: 4, funny: 4, real: 3, instant: 5 },
  { title: "Professional Seat Warmer for Cinema Premieres", weird: 3, funny: 3, real: 4, instant: 5 },
  { title: "Head of Lost Umbrella Reunions, Bus Stop Division", weird: 4, funny: 4, real: 4, instant: 4 },
  { title: "Certified Translator for Dogs Judging Their Owners", weird: 4, funny: 4, real: 3, instant: 4 },
  { title: "Senior Vice President of Sighing at Slow Wi-Fi", weird: 3, funny: 3, real: 2, instant: 5 },
];

// Score in the brief's own order: weird, then funny, then real, then
// instant. Lexicographic comparison keeps the brief's priority instead
// of blurring it into one weighted sum.
function score(c: Candidate): [number, number, number, number] {
  return [c.weird, c.funny, c.real, c.instant];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

// The shortlist must hold distinct titles: byte-identical entries
// share one rate and the earlier receipt places above its copies, so a
// duplicate in the list would be a wasted candidate.
const seen = new Set<string>();
for (const c of CANDIDATES) {
  if (seen.has(c.title)) {
    throw new Error(`duplicate candidate title: ${JSON.stringify(c.title)}`);
  }
  seen.add(c.title);
}

const title = best.title;

// Gate self-check: the entry must be UTF-8 text of 1 to 60 characters,
// not only white space.
if (title.length < 1 || title.length > 60) {
  throw new Error(`invalid entry length ${title.length}: ${JSON.stringify(title)}`);
}
if (title.trim().length === 0) {
  throw new Error("invalid entry: only white space");
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// The title alone, no trailing newline: the gate counts characters, so
// a newline would add a character the judge never asked for.
writeFileSync(`${outDir}/entry.txt`, title, "utf8");

// Read it back and re-check: the file the grader gates must be the
// title alone, nothing else.
const written = readFileSync(`${outDir}/entry.txt`, "utf8");
if (written !== title) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(title)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry: ${title} (${title.length} chars)`);
