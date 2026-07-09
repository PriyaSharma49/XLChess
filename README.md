<p align="center">
  <img src="public/xlchess-logo.png" alt="XLChess Logo" width="120"/>
</p>

<h1 align="center">♟️ XLChess</h1>

<p align="center">
  <strong>A modern, AI-powered chess platform built with Next.js, React, Tailwind CSS, and chess.js.</strong>
</p>

<p align="center">
  Play against a from-scratch AI engine across seven difficulty levels and enjoy a glassmorphism-styled interface that runs smoothly on desktop, tablet, and mobile.
</p>

---

A chess platform built with Next.js and React — play against an AI opponent across seven difficulty levels, or pass-and-play locally with a friend. Built as the hero-section deliverable for a technical assessment, extended into a fuller playable experience.

**Live demo:** [xl-chess-nine.vercel.app](https://xl-chess-nine.vercel.app/) *(update this link once redeployed — currently returning a 404)*
**Repository:** [github.com/PriyaSharma49/XLChess](https://github.com/PriyaSharma49/XLChess)

---

## Getting started

You'll need Node.js 18 or later and npm.

```bash
git clone https://github.com/PriyaSharma49/XLChess.git
cd XLChess
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

For a production build:

```bash
npm run build
npm run start
```

No environment variables are required to run the project locally.

---

## Tech stack

- **Next.js / React** — app framework and UI
- **Tailwind CSS** — styling
- **Framer Motion** — animation and transitions
- **chess.js** — move validation, game state, check/checkmate/draw detection
- **lucide-react** — icon set
- **Vercel** — hosting and deployment

The board itself is a custom-built component rather than a third-party chessboard library, which gave more control over drag-and-drop behavior, touch handling on mobile, and theming.

---

## Architecture overview

The app is organized into three rough layers:

**UI layer** — renders the board, controls, clocks, and move history, and handles user interaction and animation. This is `components/` and the Tailwind/Framer Motion styling on top of it.

**Game logic layer** — owns the rules of chess itself (via chess.js), AI move generation, opening detection, and overall game state (whose turn it is, history, check/checkmate detection). This lives in `lib/` and is deliberately kept independent of how any of it gets rendered, so the same logic could drive a different UI without a rewrite.

**Service layer** — the one place the app talks to a server: recording game results and openings for the player's statistics. Kept intentionally small.

Splitting things this way means a change to how the board looks doesn't risk touching how moves are validated, and vice versa.

---

## Code quality & engineering practices

A few practices I tried to hold to consistently:

- Components stay focused on one responsibility — `Chessboard` only handles rendering and input, `PlaySection` only handles orchestration and state.
- Game logic is kept separate from UI rendering, per the architecture above, rather than scattered across components.
- State updates avoid unnecessary re-renders where it mattered — e.g., derived values like captured pieces, material advantage, and detected opening are memoized with `useMemo` rather than recomputed on every render.
- Naming is kept consistent across components, functions, and variables.
- Reusable UI pieces (buttons, section cards, badges) are pulled into shared components rather than duplicated.

---

## What's implemented

- Play against an AI opponent, with seven difficulty tiers from beginner to grandmaster
- Local two-player mode (pass and play)
- Configurable time controls with live per-player clocks and increments
- Full rule support via chess.js: castling, en passant, pawn promotion (with a piece picker rather than auto-queening), check/checkmate, stalemate, threefold repetition, the fifty-move rule, and insufficient material
- Move history in algebraic notation, captured-piece tracking, and a material advantage indicator
- Opening detection
- Game results and openings are recorded to build up player statistics over time
- Move hints, sound effects, and multiple board themes
- Responsive layout across desktop, tablet, and mobile

---

## Accessibility

Accessibility wasn't treated as an afterthought, though it's also the area with the most room left to grow:

- Semantic HTML is used where it makes sense (buttons for interactive elements, proper heading structure, labelled controls) rather than generic `div`s with click handlers.
- Interactive elements — difficulty selectors, theme swatches, game action buttons — have visible text or `title` labels, not icon-only controls with no accessible name.
- Color choices were made with contrast in mind against the dark theme, though this hasn't been run through a formal contrast-ratio audit.
- Touch targets and layouts are sized to work on mobile, not just scaled-down desktop.

What's genuinely missing, and listed honestly under Future Improvements below: the chessboard itself isn't currently operable via keyboard, and there's no screen-reader announcement of moves, check, or checkmate. For an app whose core interaction is a drag-and-drop board, that's the biggest accessibility gap and the next thing I'd tackle.

---

## Performance

- All chess logic — move validation, AI search, game state — runs client-side, which avoids round-trip latency for something that needs to feel instant.
- Expensive derived values (captured pieces, material advantage, opening detection, paired move history) are memoized rather than recalculated on every render.
- Framer Motion is used selectively for entrance/transition animations rather than animating everything, to avoid unnecessary layout thrashing.
- Next.js's production build handles the usual optimizations — code splitting per route, image handling, minification — out of the box.

The clearest remaining performance risk is that AI search runs on the main thread; at the highest difficulty settings that's the one place a frame drop is plausible, and it's addressed under Trade-offs and Future Improvements below.

---

## Design decisions

The board and the game orchestration logic are deliberately split into two components — `Chessboard` handles rendering and input, `PlaySection` owns game state. I kept it this way mainly because it's simpler for another developer to understand: someone opening `Chessboard.js` only needs to think about rendering and input, and someone opening `PlaySection.js` only needs to think about game flow, without the two constantly crossing over each other.

That same split paid off when debugging. Because all the click, drag, and touch handling lives in one file (`Chessboard.js`), tracking down input-related issues — like the board fighting the browser's own scroll gesture on touch devices — meant looking in exactly one place instead of hunting across the codebase.

### Manual pawn promotion instead of automatic queen promotion

A chess move that required careful UX consideration was pawn promotion. Initially, promotion automatically selected a queen, because that's the most common shortcut in casual chess apps. However, this removed an important strategic decision from the player and didn't accurately represent official chess rules, where players can choose between a queen, rook, bishop, or knight.

I implemented a custom promotion picker that pauses the move after a pawn reaches the final rank and lets the player choose the piece they actually want.

This approach improves:
- **User control** — players make the real chess decision instead of the system assuming their intent.
- **Rule accuracy** — all valid promotion options are supported.
- **User experience** — the interface clearly communicates what action is required.

Automatic queen promotion is simpler to implement, but the manual picker gives a more authentic chess experience and shows attention to both game logic and interface design.

### Architecture decision: client-side AI instead of a server-based chess engine

One of the main architecture decisions was running the AI opponent entirely client-side instead of using a server-based engine such as Stockfish.

A server-based engine would provide stronger analysis and deeper search, but it would introduce real complexity: a backend service to maintain, network communication (and latency) on every move, higher hosting and infrastructure costs, and gameplay that depends on server availability.

For this project, the goal was a smooth browser-based chess experience rather than a professional competitive engine. Running the AI locally gives:
- **Instant move responses** without network delays
- **Better offline usability**, since gameplay doesn't depend on an API
- **Simpler architecture** with fewer moving parts
- **Lower deployment and maintenance costs**

The trade-off is that client-side AI has limited computational power compared to a dedicated engine — at higher difficulty levels, a deeper search could affect performance on lower-end devices. Given the project's scope and its focus on user experience, a lightweight client-side AI was the most practical choice.

With more time, the AI could move into a Web Worker to avoid blocking the main thread, or be swapped out for a stronger engine like Stockfish running through a dedicated service.

### Board sizing driven by the container, not fixed breakpoints

Rather than hardcoding board dimensions per breakpoint, the board measures its parent container's width on mount and on resize, then clamps that to a sensible maximum depending on the viewport (capped tighter on mobile, a bit looser on tablet and desktop). This keeps the board correctly sized inside whatever layout it's placed in, instead of needing separate fixed sizes maintained for every screen width — one calculation handles all of them.

### Hints use the AI engine at a fixed strength, independent of game difficulty

The hint feature reuses the same move-picking engine as the AI opponent, but always runs it at the highest strength setting regardless of what difficulty the player is currently facing. The reasoning: a hint is meant to show the player the strongest available move, not just what the current opponent would play. Reusing the existing engine also meant no separate hint-generation logic had to be built and maintained.

### Time controls with per-move increments handled centrally

Each time control (bullet, blitz, rapid, classical, or unlimited) defines its own starting time and increment in one place, and a single function applies the increment to whichever color just moved. Centralizing that logic avoids duplicating "add time after a move" handling across every code path that can produce a move (player moves, AI moves, undo), and makes it straightforward to add new time controls later without touching the clock logic itself.

---

## Assumptions

- Reviewers will test on current versions of major browsers (Chrome, Firefox, Safari, Edge); no legacy browser support was targeted.
- The brief's "hero section" scope was interpreted loosely enough to allow a fully playable centerpiece rather than a static banner, since the marking scheme explicitly rewards animation, interactivity, and UX polish — a chess platform's hero arguably *is* the board.
- Casual players are the target audience, not competitive players expecting engine-strength AI.

---

## Trade-offs

**AI runs on the main thread.** Simpler to build and fast enough at the current search depth, but at the higher difficulty settings a deeper search could cause a brief frame drop, especially on lower-end devices. Moving it into a Web Worker would fix that at the cost of added complexity — reasonable to defer given the assessment's time frame.

**Statistics are recorded without a full account system.** Game results and openings are tracked to power a stats view without requiring sign-up, which keeps the app frictionless to try but means stats currently live per-device rather than following a player across devices.

**Client-side move generation over a server-hosted engine.** Cheaper to host and simpler to reason about, but it caps how strong the AI can realistically get compared to something like Stockfish running server-side.

---

## What I'd improve with more time

- Move the AI search into a Web Worker so higher difficulties don't risk blocking the main thread
- Add automated tests — unit tests around move/AI logic, component tests for the board, and a few end-to-end flows
- Add real accounts so statistics and progress persist across devices rather than per-device
- Strengthen accessibility further: full keyboard-only piece movement, and ARIA live regions announcing moves, check, and checkmate for screen reader users
- Run a proper performance pass with Lighthouse — code-splitting the AI engine out of the initial bundle, optimizing image assets
- **Puzzle mode** — curated tactical puzzles by theme and difficulty, with post-game analysis
- **Daily tactics** — a new tactical puzzle (or short batch of puzzles) each day, encouraging players to come back and build a habit
- **Earnable badges** — unlocked by completing daily tactics streaks, playing a certain number of games, or reaching milestones, to add a light sense of progression
- **A dedicated statistics view** — surfacing the win/loss/draw record, favorite openings, and difficulty-level performance that's already being recorded, rather than just collecting it silently

---

## Project structure

```
XLChess/
├── app/           # Next.js routes and pages
├── components/    # UI components (Chessboard, PlaySection, etc.)
├── hooks/         # Custom React hooks
├── lib/           # Game logic — AI engine, opening detection, themes, sound
├── public/        # Static assets
└── package.json
```

---

## Author

**Priya Sharma**
[github.com/PriyaSharma49](https://github.com/PriyaSharma49)
