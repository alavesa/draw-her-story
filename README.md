# Draw Her Story

A drawing and guessing game celebrating the women who changed the world. Built for International Women's Day as part of the [She Builds](https://shebuilds.lovable.app/) hackathon.

**Play now at [drawherstory.win](https://drawherstory.win)**

Here is a snippet of the game.
![gameplay](https://github.com/user-attachments/assets/05a1a3ba-8814-4e78-adf7-b481915e28e3)

## How It Works

### Same Device
1. 2–3 players or teams enter their names
2. Each round, one player draws a word related to a famous woman while the others guess
3. After each round, a "Did You Know?" card reveals the woman behind the word
4. At the end, see your scores and all the women you discovered

### Multi-Device
1. One player creates a room and shares the room code
2. Other players join from their own devices using the code
3. The artist draws on their screen while others guess on theirs — all in real time
4. Same drawing, guessing, and reveal flow as same-device mode

## Features

- 54 notable women across Science, Arts, Sports, Activism, Politics, Literature, and Exploration
- Same-device pass-and-play — no accounts or internet needed
- Multi-device multiplayer — each player on their own phone or laptop
- Typo-tolerant guessing with letter hints that reveal over time
- Real-time drawing sync across devices
- Animated celebrations and sound effects
- Shareable results to spread the word

## Roadmap

- [x] Multi-device multiplayer support
- [ ] More notable women and categories

## Getting Started

Requires Node.js & npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
git clone https://github.com/alavesa/draw-her-story.git
cd draw-her-story
npm install
npm run dev
```

For multi-device multiplayer locally, also start the PartyKit server:

```sh
npm run dev:party
```

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- [PartyKit](https://partykit.io) (multi-device multiplayer)
- Web Audio API
- GitHub Pages
