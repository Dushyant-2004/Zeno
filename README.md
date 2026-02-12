# 🧠 ZENO - AI Assistant

**ZENO** is a powerful, intelligent AI chatbot built with Next.js, MongoDB, Groq, and Cohere. It features voice commands, real-time streaming responses, AI image generation, document analysis, beautiful animations, and a modern dark UI.

## ✨ Features

- **🔐 Google Authentication** - Sign in with Google via NextAuth.js, per-user chat history
- **🤖 AI-Powered Chat** - Groq (Llama 3.3 70B) as primary, Cohere (Command R+) as fallback
- **🎤 Voice Commands** - Speak to ZENO using Web Speech API
- **🔊 Text-to-Speech** - ZENO can read responses aloud
- **📡 Real-time Streaming** - Watch responses appear word by word
- **🖼️ AI Image Generation** - Generate images from text prompts using Pollinations.ai (FREE, no API key)
- **📄 File Upload & Analysis** - Upload PDF, TXT, CSV, or MD files and ask questions about their content (RAG-style)
- **💾 Conversation History** - All chats saved in MongoDB, linked to your account
- **🎨 Animated UI** - Framer Motion animations, particle backgrounds, neural network canvas
- **⌨️ Typing Effects** - Beautiful typing animation on welcome screen
- **📱 Responsive Design** - Works on desktop and mobile
- **🌙 Dark Theme** - Sleek dark UI with glassmorphism effects
- **📋 Markdown Support** - Code blocks, formatting, and more in responses

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

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key
- Cohere API key (optional fallback)
- Google OAuth credentials (Client ID & Secret)

### Setup

1. **Navigate to the project:**
   ```bash
   cd zeno-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env.local` file and add your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   MONGODB_URI=mongodb://localhost:27017/zeno
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_random_secret_string
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

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

## 🎤 Voice Commands

- Click the **microphone button** to start speaking
- ZENO will transcribe and auto-send your message
- Enable **auto-speak** (speaker icon in header) for ZENO to read responses aloud
- Click **"Speak"** on any response to hear it

## ⚙️ API Keys Required

| Key | Where to Get | Required? |
|-----|-------------|-----------|
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) | Yes |
| `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) | Optional (fallback) |
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) or local MongoDB | Yes |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Yes |
| `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Yes |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` or any random string | Yes |

> **Note:** Image generation uses Pollinations.ai which is completely free — no API key needed!

## 🔐 Authentication Flow

1. **Splash Screen** — Animated ZENO logo loads on app start
2. **Login Screen** — Google sign-in button appears (if not authenticated)
3. **Google OAuth** — User authenticates via Google popup
4. **Chat Interface** — Main app loads with user-specific conversations
5. **Sign Out** — Available in the sidebar footer with user profile

---

**Built with love by the ZENO team**
