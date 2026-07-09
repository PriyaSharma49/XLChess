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

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/chess.js-1.4-8B4513" alt="chess.js"/>
</p>

---

## ✨ Overview

XLChess is a full-featured, single-player chess web app. It pairs a custom-built AI opponent — with search depth, quiescence search, and iterative deepening at the higher levels — with a polished, animated board UI.

---

## 🎮 Features

### Gameplay
- Full legal move validation via `chess.js` — castling, en passant, pawn promotion
- Check, checkmate, stalemate, and draw detection
- Undo move, reset game, flip board
- Configurable time controls with automatic turn switching

### AI Opponent
- Seven difficulty levels: **Beginner, Easy, Intermediate, Advanced, Expert, Master, Grandmaster**
- Stronger play at higher levels via deeper search and a transposition table
- Animated "thinking" indicator and move animations

### Interface
- Multiple board themes
- Optional sound effects
- Glassmorphism design with Framer Motion animations
- Fully responsive across desktop, tablet, and mobile

### Contact
- In-app contact form powered by the Resend email API

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 15 (App Router), React 18 |
| **Styling** | Tailwind CSS, tailwindcss-animate, Framer Motion |
| **UI Components** | Radix UI primitives, shadcn/ui-style components, Lucide React icons |
| **Chess Logic** | chess.js |
| **Forms & Validation** | React Hook Form, Zod |
| **Data & State** | TanStack Query, TanStack Table, SWR |
| **Charts** | Recharts |
| **Email** | Resend |
| **Utilities** | date-fns, dayjs, lodash, uuid, clsx |
| **Tooling** | ESLint, npm / Yarn |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
xlchess/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (contact form, etc.)
│   ├── layout.js
│   ├── page.js
│   └── providers.js
├── components/
│   ├── chess/              # Board, gameplay, landing-page sections
│   └── ui/                 # Reusable shadcn/ui-style components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── chess/              # AI engine, themes, sounds
│   └── utils.js
├── public/                 # Static assets (logo, images)
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- npm or Yarn

### 1. Clone the repository

```bash
git clone https://github.com/PriyaSharma49/XLChess.git
cd XLChess/xlchess
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_contact_email
```

> ⚠️ **Note:** these values are required for the contact form to send email via Resend. Never commit real API keys to the repository — keep `.env`/`.env.local` in `.gitignore` and share only a `.env.example` with placeholder values.

### 4. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |

---

## 🌟 Roadmap

- 🌍 Online multiplayer
- 👤 User authentication
- 📈 Global leaderboard
- 🤖 Stronger Stockfish-powered AI option
- 📊 Post-game analysis
- 🏅 Tournament mode
- ☁️ Cloud save for cross-device games

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes
   ```bash
   git commit -m "Add: your feature description"
   ```
4. Push the branch
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request

---

## 👩‍💻 Developer

**Priya Sharma**
Frontend / Software Developer

[GitHub](https://github.com/PriyaSharma49) · [XLChess Repository](https://github.com/PriyaSharma49/XLChess)

---

## 💙 Acknowledgements

Built with these open-source libraries: Next.js, React, Tailwind CSS, chess.js, Framer Motion, Radix UI, Lucide React, and Resend.

---

## ⭐ Support

If you found this project useful or interesting, consider giving it a star on GitHub — it helps others discover it.

<p align="center">Built by <strong>Priya Sharma</strong></p>
