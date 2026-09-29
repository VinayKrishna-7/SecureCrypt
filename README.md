# SecureCrypt 🛡️

> **Share secret messages that self-destruct after 1 view.**

**SecureCrypt** is a simple and private tool to send sensitive messages, passwords, and confidential notes. Your message is encrypted directly on your device and permanently erased the moment it is opened.

---

### 🔑 Key Highlights

- **View Once**: The link can be opened exactly one time.
- **Auto Self-Destruct**: Message is wiped from existence immediately after reading.
- **Browser-Side Encryption**: Scrambled with AES-256 before leaving your computer.
- **Zero Knowledge**: Nobody—not even the server host—can see your message.
- **Passcode Option**: Lock your secret with a 6-digit PIN for extra safety.
- **Dark & Bright Mode**: Clean, high-contrast themes with a single click.

---

## ⚡ How It Works

1. **Write & Encrypt**: Type your secret and click *Create Encrypted Link*.
2. **Share Link**: Send the generated link (and optional passcode) to your recipient.
3. **Read & Vanish**: When the recipient clicks *Reveal*, the message is shown once and destroyed forever.

---

## 🚀 Quick Start

### 1. Install
```bash
npm run install:all
```

### 2. Run
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend (port 5173)
npm run dev:client
```


