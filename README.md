# 🎯 InterviewAce – Land Your Dream Job

```
 ___       _                  _                _            
|_ _|_ __ | |_ ___ _ ____   _(_) _____      _/ \   ___ ___ 
 | || '_ \| __/ _ \ '__\ \ / / |/ _ \ \ /\ / / _ \ / __/ _ \
 | || | | | ||  __/ |   \ V /| |  __/\ V  V / ___ \ (_|  __/
|___|_| |_|\__\___|_|    \_/ |_|\___| \_/\_/_/   \_\___\___|
```

**Train Hard. Interview Easy.**

Step into the most realistic, high-pressure mock interviews—designed to match the intensity of companies like Microsoft, Netflix, OpenAI, and more. With zero room for fluff, you'll sharpen your edge, eliminate weak spots, and develop the confidence to conquer any interview.

## Why Settle for Guesswork? Level Up with AI-Powered Mock Interviews

✅ **Hyper-Realistic Practice**  
Simulate real interview environments tailored to your target role—whether behavioral, technical, product management, design, or niche specialties.

✅ **Personalized, Actionable Feedback**  
Get detailed, AI-generated insights on your tone, word choice, structure, and substance—so you know exactly what to improve.

✅ **Real-Time Coaching**  
Our smart speech analysis helps you eliminate filler words, hesitations, and awkward phrasing—coaching you toward clear, confident delivery.

✅ **Progress Tracking**  
Track improvement across sessions with visual analytics on response quality, pacing, clarity, and confidence.

✅ **Role & Company-Specific Drills**  
Customize mock interviews to mirror the exact roles and companies you're targeting—from Big Tech giants to startups.

✅ **On-Demand or Scheduled Sessions**  
Practice whenever inspiration strikes, or book focused sessions on your schedule.

## Practice Like a Pro. Perform Like a Star.

No matter your industry or experience level, InterviewAce adapts to your needs. Prepare smarter with cutting-edge technology that refines your performance, boosts your confidence, and helps you walk into interviews fully prepared and unstoppable.

🚀 Your next big opportunity is waiting. Practice with InterviewAce today—and own the room tomorrow.

## Technical Details

Built with Gemini Multimodal Live API + Pipecat for realistic AI interactions.

<img width="500px" height="auto" src="./image.png">

**Features:**

- Ephemeral WebSocket voice mode
- Text and image HTTP chat mode
- WebRTC voice, camera, and screenshare chat mode
- Persistent conversation storage to a SQLite database

The Pipecat SDK supports both WebSockets and WebRTC. WebSockets are great for protoyping, and for server-to-server communication.

For realtime apps in production, WebRTC is the right choice. WebRTC was designed specifically for low-latency audio and video. (See [this explainer](https://www.daily.co/videosaurus/websockets-and-webrtc/) for more about WebRTC and WebSockets.)

## Getting setup

➡️ You will need a [Gemini API key](https://aistudio.google.com/app/apikey).

➡️ To use the WebRTC voice mode, you'll also need a [Daily API key](https://dashboard.daily.co/u/signup) (optional).

### Easiest Setup (Using Shell Scripts)

We've provided shell scripts for both Unix/macOS and Windows that handle the entire setup and running process:

**macOS/Linux:**
```bash
# Make the script executable (only needed once)
chmod +x dev.sh

# Set up environment, install dependencies
./dev.sh setup

# Run both client and server concurrently
./dev.sh dev
```

**Windows:**
```bat
# Set up environment, install dependencies
dev.bat setup

# Run both client and server concurrently
dev.bat dev
```

You can also run the client or server individually with `./dev.sh client`, `./dev.sh server` (or `dev.bat client`, `dev.bat server` on Windows).

### Alternative Setup (Using npm scripts)

You can also use the npm scripts to set up and run the application:

```bash
# Install dependencies for both client and server
npm install

# Set up environment, install dependencies, and configure both applications
npm run setup

# Run both client and server concurrently
npm run dev
```

Visit the URL shown in the terminal (typically http://localhost:5173).

### Manual Setup

If you prefer to set up the client and server separately, follow these instructions:

#### Server setup:

You'll need to use Python version 3.10, 3.11, or 3.12 because of various dependencies. On a Mac, the easiest thing to do is `brew install python@3.12`.

```bash
cd server
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initialize the project
python sesame.py init

# Run the server
python sesame.py run
```
This will start the Sesame server. You'll need to make note of which port it's running on. Look for a log line that says something like `Uvicorn running on http://127.0.0.1:7860 (Press CTRL+C to quit)`.

#### Client setup:

Option 1: Using the Sesame CLI

- From within the `server` directory:

  ```bash
  python sesame.py init-client
  ```

Option 2: Manually

- You can manually create the `.env.local` file in the `./client` directory:

  ```bash
  cd client
  cp env.example .env.local
  ```

  Open your `.env.local` file and make sure `VITE_SERVER_URL=http://127.0.0.1:7860/api` is using the same port as your Sesame server (defaults to 7860).

#### Run the client:

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

Visit the URL shown in the terminal. Be sure that both the server and client are running.

## Available Scripts

In the root directory, you can run:

| Command | Description |
|---------|-------------|
| `npm run setup` | Installs all dependencies and sets up both client and server |
| `npm run dev` | Runs both client and server concurrently |
| `npm run restart` | Restarts both client and server (waits 5 seconds for server to start before launching client) |