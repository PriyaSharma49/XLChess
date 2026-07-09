# ♟️ XLCHESS

XLCHESS is a modern chess platform built with **Next.js**, **React**, **Tailwind CSS**, and **Chess.js**. It offers an engaging chess experience with AI opponents, local multiplayer, responsive design, and a premium user interface.

---

## ✨ Features

- 🤖 Smart AI Opponent (7 Difficulty Levels)
- 👥 Two-Player Mode
- ♟️ Premium Interactive Chessboard
- 🖱️ Drag & Click Piece Movement
- ✔️ Complete Chess Rules
- 📱 Fully Responsive Design
- 📊 Player Statistics
- 📩 Contact Form with Resend Email Integration

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion
- Lucide React

### Chess Engine
- Chess.js

### Email Service
- Resend

### Utilities
- clsx
- tailwind-merge

---

## 📁 Project Structure

```
XLChess/
│
├── app/
│   ├── api/
│   │   └── contact/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── components/
│
├── lib/
│   ├── chess/
│   └── xlchess/
│
├── public/
│
├── package.json
├── README.md
└── .env.local
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/xlchess.git
```

### Navigate to the project

```bash
cd xlchess
```

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

Create a file named **.env.local**

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@gmail.com
```

---

## 🎮 Game Modes

- Play vs AI
- Two Player (Local)

---

## 🤖 AI Difficulty Levels

- Beginner
- Easy
- Intermediate
- Advanced
- Expert
- Master
- Grandmaster

---

## ♟️ Chess Features

- Legal Move Validation
- Castling
- En Passant
- Pawn Promotion
- Check Detection
- Checkmate Detection
- Stalemate Detection
- Undo Moves
- Move History
- PGN Export

---

## 📬 Contact Form

The contact form is powered by **Resend** and sends messages directly to the configured email address.

---

## 📱 Responsive Design

Optimized for:

- Mobile
- Tablet
- Laptop
- Desktop

---

## 📦 Build for Production

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 📄 License

This project is intended for educational and portfolio purposes.

---

## 👩‍💻 Developer

Developed by **Priya Sharma** using Next.js, React, Tailwind CSS, and Chess.js.