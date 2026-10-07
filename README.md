# 🌌 Cosmic Black Hole Gala Lucky Draw

An ultra-luxury, cinematic 3D corporate gala lucky draw web application powered by **Three.js**, **Vanilla JavaScript**, and procedural **Web Audio Synthesis**.

---

## ⚡ 1-Click Play (Instant Access)

| Platform | Launch Method | Status |
|---|---|---|
| 🌐 **Online (Any Browser)** | **[👉 Click Here to Play Online Now](https://chenjunwei1230-dotcom.github.io/cosmic-blackhole-lucky-draw/)** *(or [Alternate Mirror](http://chenjunwei.me/cosmic-blackhole-lucky-draw/))* | 🟢 Live 24/7 |
| 💻 **Local (Windows Desktop)** | Double-click **`start.bat`** in the project folder | 🟢 60 FPS Offline |

> **No setup required for players!** Simply click the online link above or double-click `start.bat` on Windows to launch directly into the full-screen cinematic cosmic stage.

---

## 🌟 Key Features

1. **3D Swirling Avatar Vortex & Saturn Ring**
   - 100 attendee avatar cards with names and department badges swirling directly within the black hole accretion disk.
   - Dynamic Keplerian orbital physics: inner tracks swirl faster than outer tracks.
   - **Celestial Obsidian-Gold Medallions**: Procedural obsidian radial gradients with double 24K gold border rings and metallic gold typography.
   - **Collapsing Vortex**: Black hole accelerates and gravitationally draws candidate cards into the singularity event horizon along Archimedean spirals.
   - **Supernova & 3D Reveal**: Megumin-inspired cosmic shockwave blast; the chosen winner's 3D card surges out from the singularity core into the front center screen.

2. **Luxury Bespoke UI & Aesthetics**
   - Obsidian frosted glassmorphism (`backdrop-filter: blur(20px)`).
   - Refined champagne gold highlights and clear typography hierarchy.
   - Floating collision-free broadcast header dock with prize tier selector, batch count controls (`x1`, `x5`, `x10`), sound toggle, hotkey guide, and full settings drawer.
   - **Celebratory Stardust Confetti**: 120 luxury golden foil flakes, champagne sparkles, and crystal motes falling gracefully on winner reveal.
   - Stage Director Mode (`C` key) and Fullscreen (`F` key).

3. **Event Operation & Settings Drawer**
   - **Prize Tiers**: Grand Prize, First Prize, Second Prize, Third Prize, Lucky Prize with configurable quotas and non-repeating winner exclusion.
   - **Candidate Roster Tab**: Live grid view of all 100 candidates with photos, badges, IDs, and real-time eligibility tags.
   - **Winners History Tab**: Slide-out drawer with instant void/re-roll capability and CSV export.
   - **Stage Director Hotkeys Matrix**: Dedicated interactive cheat sheet tab and header shortcut button.

4. **Procedural Web Audio Synthesis & Master Gain**
   - Synthesizes sub-bass rumbles, gravitational acceleration whines, supernova shockwave explosions, and celestial reveal chords directly via Web Audio API.
   - 🔊 **Master Sound Toggle**: One-click mute/unmute button in the top dock or via shortcut <kbd>M</kbd>, with animated SVG wave states and audio toast alerts.

5. **Production Post-Processing Pipeline**
   - Three.js `UnrealBloomPass` tuned for stage screens without GPU blowout.
   - ACESFilmic tone mapping and auto-responsive camera framing.

---

## 🎮 Stage Director Hotkeys

| Shortcut | Function | Description |
|---|---|---|
| <kbd>Space</kbd> / <kbd>Enter</kbd> | **Trigger Draw / Stop** | Start black hole collapse, stop vortex, or dismiss winner modal |
| <kbd>1</kbd> ~ <kbd>5</kbd> | **Switch Prize Tier** | Select Grand, 1st, 2nd, 3rd, or Lucky prize tier |
| <kbd>M</kbd> | **Toggle Audio Mute** | Instantly silence or restore Web Audio engine sound effects |
| <kbd>?</kbd> / <kbd>K</kbd> | **Hotkeys Matrix** | Open keyboard cheat sheet and stage director guide |
| <kbd>H</kbd> / <kbd>S</kbd> | **Settings & History** | Open drawer to view Roster, Winners, or System settings |
| <kbd>C</kbd> | **Clean Stage Mode** | Toggle audience-only clean view (hides HUD buttons) |
| <kbd>F</kbd> | **Fullscreen Mode** | Toggle browser fullscreen for stage projectors and LED screens |
| <kbd>Esc</kbd> | **Close Overlays** | Dismiss drawer or active modal |

---

## 🚀 Local Developer Setup

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

## 📁 Project Structure

```
├── public/
│   ├── avatars/          # Attendee portrait images (AOT001.png ~ AOT100.png)
│   └── employee.json     # 100 Attendee data entries
├── src/
│   ├── audio/            # Web Audio procedural sound synthesizer & mute engine
│   ├── core/             # FSM finite state machine, roster pool, prize management
│   ├── graphics/         # Three.js cosmic scene, black hole shaders, avatar vortex, supernova
│   ├── ui/               # Luxury winner modal, candidate roller, history drawer, settings
│   ├── main.js           # Application entry point & orchestration
│   └── style.css         # Luxury obsidian glassmorphism design system
├── start.bat             # 1-Click offline Windows launcher
├── index.html            # Main stage HTML viewport & HUD
├── package.json
└── vite.config.js
```

---

## 📄 License
MIT License.

