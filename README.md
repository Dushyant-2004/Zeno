# 🧠 ZENO - AI Assistant

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)

**ZENO** is a powerful, intelligent AI chatbot built with Next.js, MongoDB, Groq, and Cohere. It features voice commands, real-time streaming responses, AI image generation, document analysis, beautiful animations, and a modern dark UI.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Google Authentication** | Sign in with Google via NextAuth.js, per-user chat history |
| 🤖 **AI-Powered Chat** | Groq (Llama 3.3 70B) as primary, Cohere (Command R+) as fallback |
| 🎤 **Voice Commands** | Speak to ZENO using Web Speech API |
| 🔊 **Text-to-Speech** | ZENO can read responses aloud |
| 📡 **Real-time Streaming** | Watch responses appear word by word |
| 🖼️ **AI Image Generation** | Generate images from text prompts using Pollinations.ai (FREE, no API key) |
| 📄 **File Upload & Analysis** | Upload PDF, TXT, CSV, or MD files and ask questions about their content (RAG-style) |
| 💾 **Conversation History** | All chats saved in MongoDB, linked to your account |
| 🎨 **Animated UI** | Framer Motion animations, particle backgrounds, neural network canvas |
| ⌨️ **Typing Effects** | Beautiful typing animation on welcome screen |
| 📱 **Responsive Design** | Works on desktop and mobile |
| 🌙 **Dark Theme** | Sleek dark UI with glassmorphism effects |
| 📋 **Markdown Support** | Code blocks, formatting, and more in responses |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| Auth | NextAuth.js + Google OAuth 2.0 |
| AI (Primary) | Groq API — Llama 3.3 70B Versatile |
| AI (Fallback) | Cohere API — Command R+ |
| Image Generation | Pollinations.ai — Flux Models (FREE) |
| File Parsing | pdf-parse (PDF), native (TXT, CSV, MD) |
| Database | MongoDB + Mongoose |
| Voice | Web Speech API (Recognition + Synthesis) |
| UI | react-icons, react-hot-toast, react-markdown |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Groq API key** ([Get one free](https://console.groq.com/keys))
- **Cohere API key** (optional fallback) ([Get one](https://dashboard.cohere.com/api-keys))
- **Google OAuth credentials** ([Setup guide](https://console.cloud.google.com/apis/credentials))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Dushyant-2004/Zeno.git
cd Zeno/zeno-app

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create .env.local file (see Environment Variables section above)

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📁 Project Structure

```
zeno-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth Google OAuth
│   │   │   ├── chat/
│   │   │   │   ├── route.ts          # Chat API (with file context injection)
│   │   │   │   └── stream/
│   │   │   │       └── route.ts      # Streaming chat (with file context)
│   │   │   ├── conversations/
│   │   │   │   └── route.ts          # Conversation management
│   │   │   ├── image/
│   │   │   │   └── route.ts          # AI image generation endpoint
│   │   │   └── upload/
│   │   │       └── route.ts          # File upload, parse & manage
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   └── page.tsx                  # Main chat page with auth flow
│   ├── components/
│   │   ├── AuthProvider.tsx          # NextAuth session provider
│   │   ├── ChatInput.tsx             # Input with voice + file attach
│   │   ├── ChatMessage.tsx           # Message bubble with image support
│   │   ├── FileUpload.tsx            # Drag & drop file upload UI
│   │   ├── LoginScreen.tsx           # Google sign-in screen
│   │   ├── ParticleBackground.tsx    # Animated background
│   │   ├── Sidebar.tsx               # History sidebar + user profile
│   │   ├── SplashScreen.tsx          # Splash/loading screen
│   │   ├── TypingEffect.tsx          # Typing animation
│   │   └── WelcomeScreen.tsx         # Landing/welcome screen
│   ├── hooks/
│   │   ├── useVoiceCommand.ts        # Voice recognition hook
│   │   └── useZenoChat.ts           # Chat + image + file state management
│   ├── lib/
│   │   ├── models/
│   │   │   ├── Conversation.ts       # MongoDB conversation model
│   │   │   ├── UploadedFile.ts       # MongoDB uploaded file model
│   │   │   └── User.ts              # MongoDB user model
│   │   ├── fileParser.ts             # PDF, TXT, CSV, MD text extraction
│   │   ├── imageGen.ts              # Pollinations.ai image generation
│   │   ├── mongodb.ts                # Database connection
│   │   └── openai.ts                 # Groq + Cohere AI configuration
│   └── types/
│       └── speech.d.ts               # Speech API types
├── .env.local                        # Environment variables
└── package.json
```

---

## 🖼️ Image Generation

Generate AI images directly in the chat — **no API key needed!** Powered by [Pollinations.ai](https://pollinations.ai) (free, open-source).

### How to Use

Just type naturally:
- `Generate an image of a futuristic city at night`
- `Draw a cute cat in space`
- `Create a picture of a mountain landscape`
- `Imagine a robot playing guitar`
- `Paint a sunset over the ocean`

### Supported Models

| Style | Model | Size |
|-------|-------|------|
| Default | Flux | 1024×1024 |
| Realistic | Flux Realism | 1024×1024 |
| Anime | Flux Anime | 1024×1024 |
| 3D | Flux 3D | 1024×1024 |
| Landscape | Flux | 1280×720 |
| Portrait | Flux | 720×1280 |
| Fast | Turbo | 512×512 |

---

## 📄 File Upload & Analysis

Upload documents and ask ZENO questions about their content — RAG-style analysis.

### Supported Formats

| Format | Extensions |
|--------|-----------|
| PDF | `.pdf` |
| Plain Text | `.txt` |
| CSV | `.csv` |
| Markdown | `.md`, `.markdown` |

### How to Use

1. Click the **📎 paperclip icon** in the chat input (or drag & drop a file)
2. Wait for the file to be parsed (green checkmark = ready)
3. Ask any question — ZENO will use the file content as context
4. Upload up to 3 files at once, max 10MB each

---

## 🎤 Voice Commands

- Click the **microphone button** to start speaking
- ZENO will transcribe and auto-send your message
- Enable **auto-speak** (speaker icon in header) for ZENO to read responses aloud
- Click **"Speak"** on any response to hear it

---

## ⚙️ Environment Variables

Create a `.env.local` file in the `zeno-app` directory with the following variables:

| Variable | Description | Required | Where to Get |
|----------|-------------|----------|--------------|
| `GROQ_API_KEY` | Primary AI provider API key | ✅ Yes | [Groq Console](https://console.groq.com/keys) |
| `COHERE_API_KEY` | Fallback AI provider API key | ⚠️ Optional | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes | [MongoDB Atlas](https://www.mongodb.com/atlas) or local |
| `JWT_SECRET` | Secret key for JWT tokens | ⚠️ Optional | Any random string |
| `NEXT_PUBLIC_APP_NAME` | App name displayed in UI | ⚠️ Optional | Default: `ZENO` |
| `NEXT_PUBLIC_API_URL` | API base URL | ⚠️ Optional | Default: `http://localhost:3000/api` |
| `SERVER_PORT` | Server port number | ⚠️ Optional | Default: `3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ Yes | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ Yes | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `NEXTAUTH_SECRET` | NextAuth.js encryption secret | ✅ Yes | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL for NextAuth | ✅ Yes | `http://localhost:3000` (dev) |

### Example `.env.local`

```env
# AI Providers
GROQ_API_KEY=gsk_your_groq_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zeno

# Authentication
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Config
NEXT_PUBLIC_APP_NAME=ZENO
NEXT_PUBLIC_API_URL=http://localhost:3000/api
SERVER_PORT=3000
```

> **Note:** Image generation uses Pollinations.ai which is completely free — no API key needed!

---

## 🔐 Authentication Flow

1. **Splash Screen** — Animated ZENO logo loads on app start
2. **Login Screen** — Google sign-in button appears (if not authenticated)
3. **Google OAuth** — User authenticates via Google popup
4. **Chat Interface** — Main app loads with user-specific conversations
5. **Sign Out** — Available in the sidebar footer with user profile

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with ❤️ by [Dushyant](https://github.com/Dushyant-2004)**

⭐ Star this repo if you find it helpful!

</div>
