document.addEventListener("DOMContentLoaded", () => {
  const videoPromptContainer = document.getElementById("videoPromptContainer");
  const videoPrompt = document.getElementById("videoPrompt");
  const skipIntroBtn = document.getElementById("skipIntroBtn");
  const cinemaSection = document.getElementById("cinemaSection");
  const videoFlash = document.getElementById("videoFlash");
  const mainVideo = document.getElementById("mainVideo");
  const videoPlayOverlay = document.getElementById("videoPlayOverlay");
  const customPlayBtn = document.getElementById("customPlayBtn");
  const videoPickerInput = document.getElementById("videoPickerInput");
  const nextToEndingBtn = document.getElementById("nextToEndingBtn");

  if (!videoPrompt || !cinemaSection) return;

  // 1. Text prompts sequence
  const prompts = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.videoPrompts)
    ? BirthdayConfig.videoPrompts
    : [
        "Before we finish...",
        "I made something special just for you.",
        "A little video edit for my favorite person 🎬",
        "Turn up your sound, Golyaa ✨"
      ];

  let promptIndex = 0;
  let isSkipped = false;
  let promptTimer = null;
  let transitionTimer = null;

  function nextPrompt() {
    if (isSkipped) return;
    if (promptIndex < prompts.length) {
      videoPrompt.textContent = prompts[promptIndex];
      videoPrompt.classList.add("is-visible");

      // Keep visible for 1.8s, then fade out
      promptTimer = setTimeout(() => {
        if (isSkipped) return;
        videoPrompt.classList.remove("is-visible");
        videoPrompt.classList.add("is-leaving");

        transitionTimer = setTimeout(() => {
          if (isSkipped) return;
          videoPrompt.classList.remove("is-leaving");
          promptIndex++;
          nextPrompt();
        }, 700);
      }, 1800);
    } else {
      showCinemaSection();
    }
  }

  function showCinemaSection() {
    isSkipped = true;
    clearTimeout(promptTimer);
    clearTimeout(transitionTimer);
    if (videoPromptContainer) {
      videoPromptContainer.style.opacity = "0";
      videoPromptContainer.style.pointerEvents = "none";
      setTimeout(() => {
        videoPromptContainer.style.display = "none";
      }, 400);
    }
    cinemaSection.classList.add("is-visible");
  }

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showCinemaSection();
    });
  }

  // Start sequence
  setTimeout(nextPrompt, 600);

  // 2. Video Player Integration
  if (typeof BirthdayConfig !== "undefined" && BirthdayConfig.videoUrl) {
    if (mainVideo && !mainVideo.getAttribute("src")) {
      const source = mainVideo.querySelector("source");
      if (source) {
        source.src = BirthdayConfig.videoUrl;
      } else {
        mainVideo.src = BirthdayConfig.videoUrl;
      }
      mainVideo.load();
    }
  }

  // Handle Play trigger
  function handlePlayVideo() {
    if (!mainVideo) return;

    // Pause global background music so it doesn't clash with video audio
    if (typeof fadeOutMusic === "function") {
      fadeOutMusic(600);
    } else {
      const bgAudio = document.getElementById("global-background-music");
      if (bgAudio) bgAudio.pause();
    }

    if (videoPlayOverlay) {
      videoPlayOverlay.classList.add("is-hidden");
    }

    mainVideo.play().catch((err) => {
      console.log("Video play request handled: ", err);
    });
  }

  if (customPlayBtn) {
    customPlayBtn.addEventListener("click", handlePlayVideo);
  }

  if (videoPlayOverlay) {
    videoPlayOverlay.addEventListener("click", handlePlayVideo);
  }

  if (mainVideo) {
    mainVideo.addEventListener("play", () => {
      if (videoPlayOverlay) {
        videoPlayOverlay.classList.add("is-hidden");
      }
      // Duck background audio
      const bgAudio = document.getElementById("global-background-music");
      if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
      }
    });

    mainVideo.addEventListener("ended", () => {
      // Video completed! Trigger celebration sparkles & flash
      if (videoFlash) {
        videoFlash.classList.add("is-active");
      }
      spawnCelebrationParticles();

      // Resume background music gently
      if (typeof fadeInMusic === "function") {
        fadeInMusic(0.5, 1500);
      } else {
        const bgAudio = document.getElementById("global-background-music");
        if (bgAudio) bgAudio.play().catch(() => {});
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    });
  }

  // 3. Local Video Picker Support
  if (videoPickerInput && mainVideo) {
    videoPickerInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const blobUrl = URL.createObjectURL(file);
        mainVideo.src = blobUrl;
        mainVideo.load();
        handlePlayVideo();
      }
    });
  }

  // 4. Navigation to Ending Page
  if (nextToEndingBtn) {
    nextToEndingBtn.addEventListener("click", () => {
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("ending.html");
      } else {
        window.location.href = "ending.html";
      }
    });
  }

  // 5. Particle Effects generator
  function spawnCelebrationParticles() {
    const container = document.querySelector(".cinema-section");
    if (!container) return;

    const count = 40;
    const colors = ["#ff527c", "#ffd700", "#ff85ad", "#ffffff", "#b84f98"];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "cinema-particle";
      particle.style.left = `calc(50% + ${Math.random() * 80 - 40}px)`;
      particle.style.top = `calc(50% + ${Math.random() * 80 - 40}px)`;
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];

      const vx = `${Math.random() * 260 - 130}px`;
      const vy = `${Math.random() * -260 - 40}px`;

      particle.style.setProperty("--vx", vx);
      particle.style.setProperty("--vy", vy);
      particle.style.animationDelay = `${Math.random() * 0.2}s`;
      particle.style.animationDuration = `${1.8 + Math.random() * 0.8}s`;

      container.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 2600);
    }
  }
});
