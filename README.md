# 🧠 ZENO - AI Assistant

**ZENO** is a powerful, intelligent AI chatbot built with Next.js, MongoDB, Groq, and Cohere. It features voice commands, real-time streaming responses, beautiful animations, and a modern dark UI.

## ✨ Features

- **🔐 Google Authentication** - Sign in with Google via NextAuth.js, per-user chat history
- **🤖 AI-Powered Chat** - Groq (Llama 3.3 70B) as primary, Cohere (Command R+) as fallback
- **🎤 Voice Commands** - Speak to ZENO using Web Speech API
- **🔊 Text-to-Speech** - ZENO can read responses aloud
- **📡 Real-time Streaming** - Watch responses appear word by word
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

2. **Configure environment variables:**
   
   Edit `.env.local` and add your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   MONGODB_URI=mongodb://localhost:27017/zeno
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_random_secret_string
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
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
│   │   │   │   ├── route.ts          # Chat API endpoint
│   │   │   │   └── stream/
│   │   │   │       └── route.ts      # Streaming chat endpoint
│   │   │   └── conversations/
│   │   │       └── route.ts          # Conversation management
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout with AuthProvider
│   │   └── page.tsx                  # Main chat page with auth flow
│   ├── components/
│   │   ├── AuthProvider.tsx          # NextAuth session provider
│   │   ├── ChatInput.tsx             # Input with voice support
│   │   ├── ChatMessage.tsx           # Message bubble component
│   │   ├── LoginScreen.tsx           # Google sign-in screen
│   │   ├── ParticleBackground.tsx    # Animated background
│   │   ├── Sidebar.tsx               # History sidebar + user profile
│   │   ├── SplashScreen.tsx          # Splash/loading screen
│   │   ├── TypingEffect.tsx          # Typing animation
│   │   └── WelcomeScreen.tsx         # Landing/welcome screen
│   ├── hooks/
│   │   ├── useVoiceCommand.ts        # Voice recognition hook
│   │   └── useZenoChat.ts           # Chat state management
│   ├── lib/
│   │   ├── models/
│   │   │   ├── Conversation.ts       # MongoDB conversation model
│   │   │   └── User.ts              # MongoDB user model
│   │   ├── mongodb.ts                # Database connection
│   │   └── openai.ts                 # OpenAI configuration
│   └── types/
│       └── speech.d.ts               # Speech API types
├── .env.local                        # Environment variables
└── package.json
```

## 🎤 Voice Commands

- Click the **microphone button** to start speaking
- ZENO will transcribe and auto-send your message
- Enable **auto-speak** (speaker icon in header) for ZENO to read responses aloud
- Click **"Speak"** on any response to hear it

## ⚙️ API Keys Required

| Key | Where to Get |
|-----|-------------|
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) |
| `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) |
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) or use local MongoDB |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` or any random string |

## 🔐 Authentication Flow

1. **Splash Screen** — Animated ZENO logo loads on app start
2. **Login Screen** — Google sign-in button appears (if not authenticated)
3. **Google OAuth** — User authenticates via Google popup
4. **Chat Interface** — Main app loads with user-specific conversations
5. **Sign Out** — Available in the sidebar footer with user profile

---

**Built with love by the ZENO team**
