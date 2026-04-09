<div align="center">

# 🛡️ ExamShield

### *Lock the browser. Secure the exam. Zero compromises.*

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/examshield?style=social)](https://github.com/YOUR_USERNAME/examshield)
[![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/examshield)](https://github.com/YOUR_USERNAME/examshield/issues)

**A lightweight, open-source Chrome/Edge browser extension that prevents cheating during online exams
by restricting browser behavior — no backend required.**

[🚀 Get Started](#installation) · [📸 Screenshots](#screenshots) · [🤝 Contribute](#contributing) · [📜 License](#license)

---

![ExamShield Banner](https://via.placeholder.com/1200x400/0f172a/38bdf8?text=ExamShield+%E2%80%94+Secure+Online+Exam+Browser+Extension)

</div>

---

## 🧠 The Problem

Online exams are broken.

With remote learning and digital assessments becoming the norm, **cheating has never been easier**:

- Students open answer tabs mid-exam without any detection
- Copy-paste from external sources takes seconds
- Right-click menus expose hidden copy/search options
- Institutions lose credibility; top performers are unfairly disadvantaged
- Expensive proctoring software is out of reach for small colleges and startups

> 📊 Studies show that **~73% of students** admit to some form of cheating in online assessments.
> The gap between expensive enterprise proctoring tools and zero-protection quizzes is massive.

**ExamShield fills that gap — for free.**

---

## 🚀 The Solution

ExamShield is a **free, open-source browser extension** that transforms any standard browser
into a focused, locked-down exam environment — without requiring any server infrastructure,
login system, or paid subscription.

It works silently in the background, enforcing exam discipline directly at the browser level.
Student opens exam → Activates ExamShield → Browser locks down → Exam runs clean ✅
---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🚫 **Tab Blocking** | Prevents opening new tabs or switching away from the exam window |
| 📋 **Copy-Paste Disabled** | Blocks `Ctrl+C`, `Ctrl+V`, and clipboard access entirely |
| 🖱️ **Right-Click Disabled** | Removes the context menu to prevent search/copy shortcuts |
| ⚡ **Zero Latency** | Runs 100% client-side — no backend, no data collection |
| 🌐 **Cross-Browser** | Works on Chrome and Edge (Manifest V3 compliant) |
| 🔒 **Lightweight** | Under 50KB — no bloat, no tracking, no nonsense |
| 🎓 **Plug & Play** | No configuration needed — load and go |

---

## 🔐 Features Breakdown

### 🚫 1. Tab Blocking

New tab shortcuts (`Ctrl+T`, `Cmd+T`) and link-based tab opens are intercepted and blocked.
If a student attempts to open a new tab, the action is silently suppressed — keeping focus on the exam page.

```javascript
// Blocks new tab creation at the Chrome extension level
chrome.tabs.onCreated.addListener((tab) => {
  chrome.tabs.remove(tab.id);
});
```

> This covers: keyboard shortcuts, right-click → open in new tab, and middle-click link opens.

---

### 📋 2. Copy-Paste Restriction

All clipboard operations are disabled using DOM event listeners injected into the exam page:

- `Ctrl+C` / `Cmd+C` — Copy blocked
- `Ctrl+V` / `Cmd+V` — Paste blocked
- `Ctrl+X` / `Cmd+X` — Cut blocked
- Drag-and-drop text selection is also intercepted

This prevents students from copying questions into external AI tools or pasting in pre-written answers.

---

### 🖱️ 3. Right-Click Disabling

The browser's native context menu is suppressed entirely via the `contextmenu` event.
This removes quick-access options like:

- "Search Google for..."
- "Copy"
- "Inspect Element" (useful for advanced cheating attempts)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **JavaScript (ES6+)** | Core extension logic |
| **HTML5** | Popup UI |
| **CSS3** | Extension styling |
| **Chrome Extensions API** | Tab management, scripting, permissions |
| **Manifest V3** | Modern extension standard (Chrome/Edge compatible) |

---

## ⚙️ Installation

### Option 1: Manual Load (Developer Mode)

> ⚠️ This extension is not yet on the Chrome Web Store. Load it manually using the steps below.

**Step 1 — Download the Extension**

```bash
git clone https://github.com/YOUR_USERNAME/examshield.git
```

Or [Download as ZIP](https://github.com/YOUR_USERNAME/examshield/archive/refs/heads/main.zip) and extract it.

---

**Step 2 — Open Chrome Extensions Page**

Navigate to: chrome://extensions/
---

**Step 3 — Enable Developer Mode**

Toggle **"Developer mode"** in the top-right corner of the extensions page.

---

**Step 4 — Load the Extension**

1. Click **"Load unpacked"**
2. Select the extracted `examshield` folder
3. The ExamShield icon will appear in your browser toolbar ✅

---

**Step 5 — Activate During Exam**

1. Open your exam/test URL
2. Click the **ExamShield icon** in the toolbar
3. Press **"Enable Protection"**
4. The browser is now locked — exam mode is active 🔒

### Edge Browser

The same steps apply for Microsoft Edge (`edge://extensions/`). ExamShield is fully compatible with Chromium-based browsers.

---

## 📸 Screenshots

> 🔄 Replace placeholders below with actual screenshots.

**Extension Popup (Active)**

![Popup Screenshot](https://via.placeholder.com/400x250/0f172a/38bdf8?text=ExamShield+Popup+UI)

---

**Tab Blocking in Action**

![Tab Block Screenshot](https://via.placeholder.com/800x400/0f172a/f43f5e?text=Tab+Blocked+%E2%80%94+ExamShield+Active)

---

**Exam Mode Dashboard**

![Exam Mode Screenshot](https://via.placeholder.com/800x400/0f172a/22c55e?text=Exam+Mode+%E2%80%94+All+Restrictions+Active)

---

## 🎯 Use Cases

### 🎓 Colleges & Universities
Lock student browsers during remote midterms and finals. No need for expensive proctoring software — deploy ExamShield as a lightweight alternative or supplementary layer.

### 💼 Recruitment Platforms
Tech companies and HR teams running online coding assessments or aptitude tests can ensure candidates aren't Googling answers mid-test.

### 🧪 Online Test Platforms
Integrate ExamShield instructions into your test-taking flow. Ask users to install and activate before beginning — a zero-infrastructure integrity layer.

### 📚 Students (Self-Discipline Mode)
Students who want to practice under real exam conditions can activate ExamShield themselves to simulate a focused test environment.

---

## ⚠️ Limitations

We believe in honesty. ExamShield is a **deterrent**, not an absolute lock. Here's what it currently **cannot** prevent:

| Limitation | Why |
|-----------|-----|
| 🖥️ Secondary device usage | Cannot detect phones or second monitors |
| 👁️ Screen sharing to a helper | No video monitoring capability |
| 🧩 Other browsers | Only works on the browser it's installed in |
| 🛠️ Extension removal | A determined user can disable it before the exam |
| 🤖 AI tools on other devices | External ChatGPT usage is undetectable |

> ExamShield works best when combined with human supervision, time limits, and question randomization.

---

## 🔮 Future Improvements

We have big plans. Here's what's on the roadmap:

- [ ] 🤖 **AI-Powered Proctoring** — Detect suspicious behavior patterns
- [ ] 👁️ **Face Detection** — Verify student presence via webcam (WebRTC + ML)
- [ ] 📸 **Periodic Screenshots** — Capture exam screen at random intervals
- [ ] 🔄 **Tab Switch Detection** — Log and alert on window focus loss
- [ ] 🖥️ **Full-Screen Enforcement** — Force exam into fullscreen mode
- [ ] 📊 **Admin Dashboard** — View exam integrity reports per student
- [ ] 🌍 **Firefox Support** — Extend to Manifest V2/V3 Firefox builds
- [ ] 🔗 **LMS Integration** — Plugins for Moodle, Canvas, Google Classroom

> Want to work on any of these? [Open a PR!](#contributing)

---

## 🤝 Contributing

Contributions are what make open source amazing. All contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "Add: amazing feature description"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

### 🐛 Found a Bug?

[Open an Issue](https://github.com/YOUR_USERNAME/examshield/issues/new?template=bug_report.md)
with steps to reproduce. We respond within 48 hours.

---

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
