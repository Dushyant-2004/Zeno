# 🧠 ZENO - AI Assistant

**ZENO** is a powerful, intelligent AI chatbot built with Next.js, MongoDB, and OpenAI. It features voice commands, real-time streaming responses, beautiful animations, and a modern dark UI.

## ✨ Features

- **🤖 AI-Powered Chat** - Powered by OpenAI GPT-4o-mini for intelligent responses
- **🎤 Voice Commands** - Speak to ZENO using Web Speech API
- **🔊 Text-to-Speech** - ZENO can read responses aloud
- **📡 Real-time Streaming** - Watch responses appear word by word
- **💾 Conversation History** - All chats saved in MongoDB
- **🎨 Animated UI** - Framer Motion animations, particle backgrounds, neural network canvas
- **⌨️ Typing Effects** - Beautiful typing animation on welcome screen
- **📱 Responsive Design** - Works on desktop and mobile
- **🌙 Dark Theme** - Sleek dark UI with glassmorphism effects
- **📋 Markdown Support** - Code blocks, formatting, and more in responses

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| AI | OpenAI GPT-4o-mini |
| Database | MongoDB + Mongoose |
| Voice | Web Speech API (Recognition + Synthesis) |
| UI | react-icons, react-hot-toast, react-markdown |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Setup

1. **Navigate to the project:**
   ```bash
   cd zeno-app
   ```

2. **Configure environment variables:**
   
   Edit `.env.local` and add your keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=mongodb://localhost:27017/zeno
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
│   │   │   ├── chat/
│   │   │   │   ├── route.ts          # Chat API endpoint
│   │   │   │   └── stream/
│   │   │   │       └── route.ts      # Streaming chat endpoint
│   │   │   └── conversations/
│   │   │       └── route.ts          # Conversation management
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main chat page
│   ├── components/
│   │   ├── ChatInput.tsx             # Input with voice support
│   │   ├── ChatMessage.tsx           # Message bubble component
│   │   ├── ParticleBackground.tsx    # Animated background
│   │   ├── Sidebar.tsx               # Conversation history sidebar
│   │   ├── TypingEffect.tsx          # Typing animation
│   │   └── WelcomeScreen.tsx         # Landing/welcome screen
│   ├── hooks/
│   │   ├── useVoiceCommand.ts        # Voice recognition hook
│   │   └── useZenoChat.ts           # Chat state management
│   ├── lib/
│   │   ├── models/
│   │   │   └── Conversation.ts       # MongoDB model
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
| `OPENAI_API_KEY` | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) or use local MongoDB |

---

**Built with love by the ZENO team**
