const BirthdayConfig = {
  // Global Settings
  birthdayPersonName: "Gauri",
  nickname: "Golyaa",
  musicUrl: "0628.mp3", // Custom soundtrack file
  voiceNoteUrl: "", // Optional voice note audio file path (e.g. "assets/audio/voice.mp3")
  videoUrl: "video.mp4", // Path to the video edit for Golyaa

  // Chapter 0 - Confession Passcode Lock Settings
  confessionQuestion: "What is the exact time he confessed to you ??",
  confessionPin: "1209", // Hour: 12, Minute: 09
  confessionSuccessMessage: "That's the exact moment! ❤️",
  confessionWrongMessages: [
    "Not quite that time, Golyaa... think back to that moment 💕",
    "Close, but not that exact minute! 🤭",
    "Think of when your hearts connected... 🌙"
  ],

  // Chapter 2 - Memory Hunt Settings
  correctGiftIndex: 2, // 0-4 index of correct box
  wrongGiftMessages: [
    "Not this one, Golyaa 🤭",
    "Try again, Golyaa! 💕",
    "Almost there ✨",
    "Keep looking 👀",
    "Nope... not this one Golyaa 🥹"
  ],

  // Chapter 3 - Letter Settings
  letterText: "Hey, my favourite girl 🥹💗\n\nI just want you to know that you mean so much to me. Your smile makes my day better, and having you in my life is something I'll always be grateful for. 🫶🏻💕\n\nNo matter what, you’ll always have a special place in my heart. I love you so much ❤️🧿",
  letterSignature: "Always with lots of love ❤️",

  // Chapter 4 - Surprise Box Settings
  floatingMemories: [
    { caption: "Your smile ✨", photo: "surprise/your_smile.jpg" },
    { caption: "That day 📸", photo: "surprise/that_day.jpg" },
    { caption: "Us ❤️", photo: "surprise/us.jpg" },
    { caption: "Always 🌙", photo: "surprise/always.jpg" }
  ],

  // Chapter 5 - Video Reveal Prompts
  videoPrompts: [
    "Before we finish...",
    "I made something special just for you.",
    "A little video edit for my favorite person 🎬",
    "Turn up your sound, Golyaa ✨"
  ],

  // Chapter 6 - Ending Text Sequence
  endingLines: [
    "One last thing, Golyaa...",
    "Thank you for being in my life.",
    "You make every single day better.",
    "The gift was never just this website...",
    "It was the smile I hoped it would bring to your face ❤️"
  ]
};
