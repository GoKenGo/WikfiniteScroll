# WikfiniteScroll — Casual Scrolling For The Weary Traveler

**Stop doomscrolling. Start learning.**

An addictive infinite-scroll feed that hijacks Twitter's UX patterns to teach you something instead. Beautiful editorial brutalism meets Wikipedia.

## ✨ Features

- **Infinite Scroll** — Random Wikipedia articles, endlessly
- **Editorial Brutalism** — Electric lime (#CCFF00) accents, asymmetric layouts, bold serif typography
- **News Breaks** — Top headlines every 5 posts to keep you plugged in
- **Favorites** — Heart articles to save for later (localStorage)
- **Share to Twitter** — One-click tweet with article excerpt
- **Mobile-First** — Responsive design that looks stunning on any screen
- **Offline Demo** — Fully self-contained version for showcasing

## 🎨 Design Philosophy

**Typography:**
- **Crimson Pro** (900 weight) — Bold editorial headlines
- **Space Mono** — Technical brutalist tags
- **Manrope** — Clean, readable body text

**Visual Identity:**
- Electric lime accent (#CCFF00) — unexpected, energetic
- Asymmetric post layouts — breaks the web grid
- Grain texture overlay — editorial sophistication
- 2px borders everywhere — brutalist edge
- Staggered reveal animations — smooth loading experience


## 🚀 Quick Start

### Live Version
```bash
# Clone the repo
git clone https://github.com/yourusername/scroll.git

# Open in browser
open scroll-editorial.html
```

### Offline Demo
```bash
open scroll-offline-demo.html
```

No build process, no dependencies, just open the HTML file.

## 📁 File Structure

```
scroll/
├── scroll-editorial.html      # Main version (live Wikipedia API)
├── scroll-offline-demo.html   # Demo version (dummy content, no API)
├── scroll-standalone.html     # Self-contained (system fonts, no external deps)
├── README.md
├── LICENSE
└── .gitignore
```

## 🛠 Technical Details

**Stack:**
- Pure HTML/CSS/JavaScript (no frameworks)
- Wikipedia REST API for random articles
- Google Fonts (Crimson Pro, Space Mono, Manrope)
- localStorage for favorites persistence

**APIs Used:**
- `https://en.wikipedia.org/api/rest_v1/page/random/summary` — Random Wikipedia articles
- Google News links for news breaks (placeholder URLs)
- Twitter Web Intent API for sharing

**Browser Support:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## 🎯 Versions Explained

| Version | Use Case | Dependencies |
|---------|----------|--------------|
| `scroll-editorial.html` | **Production** — Live Wikipedia content | Google Fonts, Wikipedia API |
| `scroll-offline-demo.html` | **Demo** — Showcase design offline | Google Fonts only |
| `scroll-standalone.html` | **No-deps** — Works anywhere, system fonts | None (100% self-contained) |

## 🔮 Roadmap

- [ ] Favorites modal view (see all saved articles)
- [ ] Filter by category (science, history, people, facts)
- [ ] Dark/light theme toggle
- [ ] "Read later" queue
- [ ] Stats dashboard (time saved vs Twitter, articles read)
- [ ] Share to Reddit, LinkedIn, WhatsApp
- [ ] PWA support (install as app)
- [ ] Service worker (true offline capability)
- [ ] Backend for news API integration
- [ ] User accounts & sync across devices

## 🤝 Contributing

Contributions welcome! Here's how:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Ideas for contributions:**
- Better topic extraction from news headlines
- More sophisticated random article selection
- Accessibility improvements
- Performance optimizations
- New visual themes
- Translation support

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Credits

- Inspired by [WikiTok](https://wikitok.com) by Isaac Gemal
- Built with frustration about doomscrolling
- Made for people who want to learn, not just consume

## 💬 Feedback

Found a bug? Have a feature request? Open an issue!

---

**Remember:** The goal isn't to replace news reading — it's to replace mindless scrolling with mindful learning. When you catch yourself reaching for Twitter, open this instead. Same dopamine hit, better outcome.

**Made with ❤︎ and electric lime**
