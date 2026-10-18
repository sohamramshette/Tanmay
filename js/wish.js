function initWishPage() {
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
    skipIntroBtn.onclick = (e) => {
      e.stopPropagation();
      showCinemaSection();
    };
  }

  setTimeout(nextPrompt, 600);

  // Set video source from config if specified
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

  function pauseSongForVideo() {
    if (typeof pauseMusicForVideo === "function") {
      pauseMusicForVideo();
    } else {
      sessionStorage.setItem("videoPlaying", "true");
      const bgAudio = document.getElementById("global-background-music");
      if (bgAudio) bgAudio.pause();
    }
  }

  function resumeSongAfterVideo() {
    if (typeof resumeMusicAfterVideo === "function") {
      resumeMusicAfterVideo();
    } else {
      sessionStorage.removeItem("videoPlaying");
      const bgAudio = document.getElementById("global-background-music");
      if (bgAudio) bgAudio.play().catch(() => {});
    }
  }

  function handlePlayVideo() {
    if (!mainVideo) return;
    pauseSongForVideo();
    if (videoPlayOverlay) {
      videoPlayOverlay.classList.add("is-hidden");
    }
    mainVideo.play().catch((err) => {
      console.log("Video play request handled: ", err);
    });
  }

  if (customPlayBtn) {
    customPlayBtn.onclick = handlePlayVideo;
  }

  if (videoPlayOverlay) {
    videoPlayOverlay.onclick = handlePlayVideo;
  }

  if (mainVideo) {
    mainVideo.onplay = () => {
      if (videoPlayOverlay) {
        videoPlayOverlay.classList.add("is-hidden");
      }
      pauseSongForVideo();
    };

    mainVideo.onplaying = () => {
      pauseSongForVideo();
    };

    mainVideo.onpause = () => {
      if (!mainVideo.ended) {
        resumeSongAfterVideo();
      }
    };

    mainVideo.onended = () => {
      if (videoFlash) {
        videoFlash.classList.add("is-active");
      }
      spawnCelebrationParticles();
      resumeSongAfterVideo();

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    };
  }

  if (videoPickerInput && mainVideo) {
    videoPickerInput.onchange = function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        const blobUrl = URL.createObjectURL(file);
        mainVideo.src = blobUrl;
        mainVideo.load();
        handlePlayVideo();
      }
    };
  }

  if (nextToEndingBtn) {
    nextToEndingBtn.onclick = () => {
      resumeSongAfterVideo();
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("ending.html");
      } else {
        window.location.href = "ending.html";
      }
    };
  }

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
}

window.initWishPage = initWishPage;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWishPage);
} else {
  initWishPage();
}
