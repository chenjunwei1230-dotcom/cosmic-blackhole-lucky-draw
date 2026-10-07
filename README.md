# 🌌 Cosmic Black Hole Gala Lucky Draw

An ultra-luxury, cinematic 3D corporate gala lucky draw web application powered by **Three.js**, **Vanilla JavaScript**, and procedural **Web Audio Synthesis**.

---

## 🌟 Key Features

1. **3D Swirling Avatar Vortex**
   - 100 attendee avatar cards with names and department badges swirling directly within the black hole accretion disk.
   - Dynamic Keplerian orbital physics: inner tracks swirl faster than outer tracks.
   - **Collapsing State**: Gravitational vortex accelerates and draws candidate cards into the singularity event horizon along Archimedean spirals.
   - **Supernova & Reveal**: Explosive cosmic shockwave blast; the chosen winner's 3D card surges out from the singularity core into the front center screen.

2. **Luxury Bespoke UI (Adhering to Modern Design Principles)**
   - Obsidian frosted glassmorphism (`backdrop-filter: blur(20px)`).
   - Refined champagne gold highlights and typography hierarchy.
   - Floating pill navigation bar with prize tier selector and batch count controls (`x1`, `x5`, `x10`).
   - Clean Stage Mode (`C` key) and Fullscreen (`F` key).

3. **Event Operation & Prize Management**
   - Configurable Prize Tiers: Grand Prize (特等奖), First Prize, Second Prize, Third Prize, Lucky Prize.
   - Quota tracking and non-repeating winner exclusion logic.
   - Attendee pool management: built-in Attack on Titan roster, JSON/CSV roster import support.
   - Slide-out Winner History Drawer with live void/re-roll capability and CSV export.

4. **Procedural Web Audio Synthesis**
   - Zero external audio files required — synthesizes sub-bass rumbles, gravitational acceleration whines, supernova shockwave explosions, and celestial reveal chords directly via Web Audio API.

5. **Production Post-Processing Pipeline**
   - Three.js `UnrealBloomPass` tuned for stage screens without GPU runaway or blowout.
   - ACESFilmic tone mapping and responsive camera framing.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🎮 Keyboard Controls

| Key | Action |
|---|---|
| `Space` / `Enter` | Trigger Draw / Stop Draw / Close Modal |
| `1` ~ `5` | Switch Prize Tier |
| `C` | Toggle Clean Stage View (Hide HUD for audience) |
| `F` | Toggle Fullscreen |
| `H` / `Esc` | Toggle / Close Winner History Drawer |

---

## 📁 Project Structure

```
├── public/
│   ├── avatars/          # Attendee portrait images (AOT001.png ~ AOT100.png)
│   └── employee.json     # 100 Attendee data entries
├── src/
│   ├── audio/            # Web Audio procedural sound synthesizer
│   ├── core/             # FSM finite state machine, roster pool, prize management
│   ├── graphics/         # Three.js cosmic scene, black hole shaders, avatar vortex, supernova
│   ├── ui/               # Luxury winner modal, candidate roller, history drawer
│   ├── main.js           # Application entry point & orchestration
│   └── style.css         # Luxury obsidian glassmorphism design system
├── index.html            # Main stage HTML viewport & HUD
├── package.json
└── vite.config.js
```

---

## 📄 License
MIT License.
