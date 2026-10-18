let audioInstance = null;
let activeFadeTimer = null;
let isRestoringTime = false;
let isTransitioning = false;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Page Transition Overlay if missing
  let overlay = document.querySelector(".page-transition-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "page-transition-overlay";
    document.body.prepend(overlay);
  }

  // 2. Inject Ambient Particle Layer if not present
  let ambientLayer = document.querySelector(".ambient");
  if (!ambientLayer) {
    ambientLayer = document.createElement("div");
    ambientLayer.className = "ambient";
    ambientLayer.setAttribute("aria-hidden", "true");
    ambientLayer.innerHTML = `
      <span class="aura aura-one"></span>
      <span class="aura aura-two"></span>
      <span class="aura aura-three"></span>
      <div id="particleLayer" class="particle-layer"></div>
    `;
    document.body.appendChild(ambientLayer);
  }

  // 3. Inject Progress Indicator (for chapters 1 to 5)
  updateProgressIndicator();

  // 4. Clean any stale video flags if no video element is present
  const videoEl = document.getElementById("mainVideo");
  if (!videoEl) {
    sessionStorage.removeItem("videoPlaying");
  }

  // 5. Initialize Background Music (once per session, preserved continuously across all chapters)
  initBackgroundMusic();

  // 6. Spawn Ambient Particles
  createAmbientParticles();

  // 7. Trigger Page Load Animations
  setTimeout(() => {
    if (overlay) overlay.classList.add("is-loaded");
    const mainJourney = document.querySelector("main.journey");
    if (mainJourney) {
      mainJourney.classList.add("is-active");
    }
  }, 100);
});

// Particle Spawning Logic
function createAmbientParticles() {
  const particleLayer = document.getElementById("particleLayer");
  if (!particleLayer || particleLayer.children.length > 0) return;

  const symbols = ["✦", "♡", "·", "✧"];
  const fragment = document.createDocumentFragment();
  const count = window.innerWidth < 600 ? 18 : 35;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = symbols[index % symbols.length];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${12 + Math.random() * 15}s`;
    particle.style.animationDelay = `${Math.random() * -20}s`;
    particle.style.opacity = `${0.2 + Math.random() * 0.5}`;
    particle.style.fontSize = `${0.6 + Math.random() * 0.9}rem`;
    fragment.appendChild(particle);
  }

  particleLayer.appendChild(fragment);
}

// Top Navigation Bar Container
function getOrCreateTopNavBar() {
  let navBar = document.getElementById("topNavBar");
  if (!navBar) {
    navBar = document.createElement("header");
    navBar.id = "topNavBar";
    navBar.className = "top-bar-nav";
    document.body.appendChild(navBar);
  }
  return navBar;
}

// Progress Indicator Logic
function updateProgressIndicator() {
  const mainJourney = document.querySelector("main.journey");
  if (!mainJourney) return;

  const navBar = getOrCreateTopNavBar();
  let progressPill = document.getElementById("progressIndicator");

  const chapter = mainJourney.getAttribute("data-chapter");
  const lockSection = document.getElementById("lockSection");
  const isLockScreenActive = lockSection && lockSection.style.display !== "none" && !lockSection.classList.contains("fade-out");

  // Only show progress indicator when on chapters 1 to 5 and lock screen is not active
  if (!isLockScreenActive && chapter && parseInt(chapter, 10) >= 1 && parseInt(chapter, 10) <= 5) {
    const html = `Chapter ${chapter} of 6 <span aria-hidden="true" class="progress-heart-container" style="color: var(--pink); display: inline-flex; align-items: center; margin-left: 0.35rem; vertical-align: middle; width: 0.95rem; height: 0.95rem;"><svg viewBox="0 0 24 24" fill="currentColor" style="width: 100%; height: 100%;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
    if (!progressPill) {
      progressPill = document.createElement("div");
      progressPill.id = "progressIndicator";
      progressPill.className = "progress-indicator";
      navBar.prepend(progressPill);
    }
    progressPill.innerHTML = html;
    progressPill.style.display = "inline-flex";
  } else if (progressPill) {
    progressPill.style.display = "none";
  }
}

// Background Music Logic
function initBackgroundMusic() {
  if (typeof BirthdayConfig === "undefined" || !BirthdayConfig.musicUrl) return;

  const path = window.location.pathname;
  const isStartPage = path.includes("index.html") || path === "/" || path === "" || path.endsWith("/");

  // If on index.html (Chapter 1), always reset to a clean state so music plays from start
  if (isStartPage) {
    sessionStorage.removeItem("videoPlaying");
    sessionStorage.setItem("musicPlaying", "true");
    sessionStorage.setItem("musicTime", "0");
  }

  // If audio element already exists and is playing, don't recreate or disrupt it
  if (audioInstance && document.getElementById("global-background-music")) {
    if (isStartPage) {
      audioInstance.currentTime = 0;
      attemptPlayMusic();
    }
    return;
  }

  let audio = document.getElementById("global-background-music");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "global-background-music";
    audio.loop = true;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");

    const source1 = document.createElement("source");
    source1.src = BirthdayConfig.musicUrl || "0628.mp3";
    source1.type = "audio/mpeg";
    audio.appendChild(source1);

    const source2 = document.createElement("source");
    source2.src = "0628.mp3";
    source2.type = "audio/mpeg";
    audio.appendChild(source2);

    audio.src = BirthdayConfig.musicUrl || "0628.mp3";
    document.body.appendChild(audio);
  }

  audioInstance = audio;
  audio.loop = true;
  audio.volume = 0.65;
  audio.muted = false;

  // Track ended loop safety (~2.55 min / 175s)
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    sessionStorage.setItem("musicTime", "0");
    audio.play().catch(() => {});
  });

  // Track playback time
  audio.addEventListener("timeupdate", () => {
    // Only pause if the video element is actually currently in the DOM and playing
    const v = document.getElementById("mainVideo");
    if (v && !v.paused) {
      if (!audio.paused) audio.pause();
      return;
    }

    if (isRestoringTime) return;

    if (!audio.paused && !isNaN(audio.currentTime)) {
      sessionStorage.setItem("musicTime", audio.currentTime.toString());

      // Auto-loop when song finishes its full 2.55 min track
      if (audio.duration && audio.currentTime >= audio.duration - 0.25) {
        audio.currentTime = 0;
        sessionStorage.setItem("musicTime", "0");
      }
    }
  });

  // Save on page leave / refresh
  window.addEventListener("beforeunload", () => {
    if (audioInstance && !isNaN(audioInstance.currentTime) && !isRestoringTime) {
      sessionStorage.setItem("musicTime", audioInstance.currentTime.toString());
      sessionStorage.setItem("musicPlaying", (!audioInstance.paused).toString());
    }
  });

  audio.addEventListener("play", () => updateMusicPill(true));
  audio.addEventListener("pause", () => {
    const v = document.getElementById("mainVideo");
    if (!v || v.paused) {
      updateMusicPill(false);
    }
  });

  // Inject floating music toggle indicator
  injectMusicPill();

  // If restoring on refresh of a later chapter (e.g. Chapter 3)
  const savedTimeStr = sessionStorage.getItem("musicTime");
  const savedTime = (!isStartPage && savedTimeStr && !isNaN(parseFloat(savedTimeStr))) ? parseFloat(savedTimeStr) : 0;

  if (savedTime > 0) {
    isRestoringTime = true;
    const applySeek = () => {
      try {
        if (audio.duration && savedTime < audio.duration) {
          audio.currentTime = savedTime;
        }
      } catch (e) {}
      setTimeout(() => {
        isRestoringTime = false;
        attemptPlayMusic();
      }, 300);
    };

    if (audio.readyState >= 1) {
      applySeek();
    } else {
      audio.addEventListener("loadedmetadata", applySeek, { once: true });
      audio.addEventListener("canplay", applySeek, { once: true });
      setTimeout(applySeek, 500);
    }
  } else {
    isRestoringTime = false;
    audio.currentTime = 0;
    attemptPlayMusic();
  }
}

function injectMusicPill() {
  if (document.getElementById("musicPill")) return;

  const pill = document.createElement("button");
  pill.id = "musicPill";
  pill.type = "button";
  pill.className = "music-pill";
  pill.setAttribute("aria-label", "Toggle background music");
  pill.setAttribute("title", "Music (tap to play/pause)");
  pill.innerHTML = `
    <span class="music-pill-icon" aria-hidden="true">🎵</span>
    <span class="music-pill-bars" aria-hidden="true">
      <span class="bar bar-1"></span>
      <span class="bar bar-2"></span>
      <span class="bar bar-3"></span>
    </span>
  `;

  pill.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!audioInstance) return;
    if (audioInstance.paused) {
      startGlobalMusic();
      updateMusicPill(true);
    } else {
      pauseGlobalMusic();
      updateMusicPill(false);
    }
  });

  const navBar = getOrCreateTopNavBar();
  navBar.appendChild(pill);
}

function updateMusicPill(isPlaying) {
  const pill = document.getElementById("musicPill");
  if (!pill) return;
  if (isPlaying) {
    pill.classList.add("is-playing");
    pill.classList.remove("is-paused");
    pill.setAttribute("title", "0628.mp3 Playing (tap to pause)");
  } else {
    pill.classList.remove("is-playing");
    pill.classList.add("is-paused");
    pill.setAttribute("title", "0628.mp3 Paused (tap to play)");
  }
}

function pauseGlobalMusic() {
  sessionStorage.setItem("musicPlaying", "false");
  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
    activeFadeTimer = null;
  }
  if (audioInstance) {
    audioInstance.pause();
  }
  updateMusicPill(false);
}

function resumeGlobalMusic(targetVolume = 0.65) {
  const videoEl = document.getElementById("mainVideo");
  if (videoEl && !videoEl.paused) return;

  sessionStorage.setItem("musicPlaying", "true");
  sessionStorage.removeItem("videoPlaying");
  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
    activeFadeTimer = null;
  }
  if (audioInstance) {
    audioInstance.volume = targetVolume;
    audioInstance.play().then(() => updateMusicPill(true)).catch(() => {});
  }
}

// Special handlers for Chapter 5 video pausing/resuming
function pauseMusicForVideo() {
  sessionStorage.setItem("videoPlaying", "true");
  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
    activeFadeTimer = null;
  }
  if (audioInstance) {
    audioInstance.pause();
  }
  updateMusicPill(false);
}

function resumeMusicAfterVideo() {
  sessionStorage.removeItem("videoPlaying");
  sessionStorage.setItem("musicPlaying", "true");
  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
    activeFadeTimer = null;
  }
  if (audioInstance) {
    audioInstance.volume = 0.65;
    audioInstance.play().then(() => updateMusicPill(true)).catch(() => {});
  }
}

window.pauseMusicForVideo = pauseMusicForVideo;
window.resumeMusicAfterVideo = resumeMusicAfterVideo;

function startGlobalMusic() {
  const videoEl = document.getElementById("mainVideo");
  if (videoEl && !videoEl.paused) return;

  sessionStorage.removeItem("videoPlaying");
  sessionStorage.setItem("musicPlaying", "true");

  if (audioInstance) {
    if (audioInstance.paused) {
      audioInstance.play().then(() => {
        updateMusicPill(true);
      }).catch((e) => {
        console.log("startGlobalMusic play request deferred:", e);
      });
    }
  }
}

window.startGlobalMusic = startGlobalMusic;

function attemptPlayMusic() {
  if (!audioInstance) return;

  const videoEl = document.getElementById("mainVideo");
  if (videoEl && !videoEl.paused) return;

  sessionStorage.removeItem("videoPlaying");
  sessionStorage.setItem("musicPlaying", "true");

  const tryPlay = () => {
    const v = document.getElementById("mainVideo");
    if (v && !v.paused) return;

    audioInstance.play()
      .then(() => {
        removeUnlockListeners();
        updateMusicPill(true);
      })
      .catch((err) => {
        updateMusicPill(false);
      });
  };

  const unlockEvents = ["click", "touchstart", "touchend", "mousedown", "pointerdown", "keydown"];

  const handleInteraction = (e) => {
    // Don't intercept clicks destined for Chapter 5 video
    if (e && e.target && (e.target.closest("#mainVideo") || e.target.closest("#videoPlayOverlay") || e.target.closest("#customPlayBtn"))) {
      return;
    }
    tryPlay();
  };

  const removeUnlockListeners = () => {
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleInteraction, { capture: true });
      document.removeEventListener(evt, handleInteraction, { capture: true });
    });
  };

  const addUnlockListeners = () => {
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, handleInteraction, { capture: true, passive: true });
      document.addEventListener(evt, handleInteraction, { capture: true, passive: true });
    });
  };

  // Add listeners immediately so any user gesture unlocks playback
  addUnlockListeners();

  // Try immediate autoplay (works on localhost / if already granted)
  tryPlay();
}

// Volume fade transitions (for playing voice notes cleanly)
function fadeOutMusic(duration = 600) {
  if (!audioInstance) return;
  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
  }
  const startVolume = audioInstance.volume;
  const interval = 50;
  const steps = duration / interval;
  const delta = startVolume / steps;

  activeFadeTimer = setInterval(() => {
    if (audioInstance.volume > delta) {
      audioInstance.volume -= delta;
    } else {
      audioInstance.volume = 0;
      audioInstance.pause();
      clearInterval(activeFadeTimer);
      activeFadeTimer = null;
    }
  }, interval);
}

function fadeInMusic(targetVolume = 0.65, duration = 800) {
  if (!audioInstance) return;
  const videoEl = document.getElementById("mainVideo");
  if (videoEl && !videoEl.paused) return;

  if (activeFadeTimer) {
    clearInterval(activeFadeTimer);
  }

  audioInstance.volume = 0;
  sessionStorage.setItem("musicPlaying", "true");
  audioInstance.play().then(() => {
    const interval = 50;
    const steps = duration / interval;
    const delta = targetVolume / steps;

    activeFadeTimer = setInterval(() => {
      if (audioInstance.volume < targetVolume - delta) {
        audioInstance.volume += delta;
      } else {
        audioInstance.volume = targetVolume;
        clearInterval(activeFadeTimer);
        activeFadeTimer = null;
      }
    }, interval);
  }).catch(() => {});
}

// SPA Seamless Page Transition Engine
function executeChapterInit(url) {
  const cleanUrl = url.split("?")[0].split("#")[0];
  const filename = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1) || "index.html";

  // Clean videoPlaying flag whenever leaving chapter 5
  if (filename !== "wish.html") {
    sessionStorage.removeItem("videoPlaying");
  }

  // Update progress indicator
  updateProgressIndicator();

  // Ensure music pill is present
  injectMusicPill();
  if (audioInstance) {
    updateMusicPill(!audioInstance.paused);
  }

  // Dispatch to the active chapter's initializer
  if (filename === "index.html" || filename === "") {
    if (typeof initInvitationPage === "function") initInvitationPage();
  } else if (filename === "gift.html") {
    if (typeof initGiftPage === "function") initGiftPage();
  } else if (filename === "letter.html") {
    if (typeof initLetterPage === "function") initLetterPage();
  } else if (filename === "surprise.html") {
    if (typeof initSurprisePage === "function") initSurprisePage();
  } else if (filename === "wish.html") {
    if (typeof initWishPage === "function") initWishPage();
  } else if (filename === "ending.html") {
    if (typeof initEndingPage === "function") initEndingPage();
  }
}

async function navigateWithTransition(url, pushToHistory = true) {
  if (isTransitioning) return;
  isTransitioning = true;

  const overlay = document.querySelector(".page-transition-overlay");
  if (overlay) {
    overlay.classList.remove("is-loaded");
    overlay.classList.add("is-exiting");
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const newMain = doc.querySelector("main.journey");
    const currentMain = document.querySelector("main.journey");

    if (!newMain || !currentMain) {
      throw new Error("Missing main.journey container in response");
    }

    // Wait for exit transition fade
    await new Promise((resolve) => setTimeout(resolve, 380));

    // Update document title
    if (doc.title) {
      document.title = doc.title;
    }

    // Update dark body mode
    if (doc.body.classList.contains("is-dark")) {
      document.body.classList.add("is-dark");
    } else {
      document.body.classList.remove("is-dark");
    }

    // Replace journey element seamlessly (Audio element on body is NEVER unloaded!)
    currentMain.replaceWith(newMain);

    // Scroll to top instantly
    window.scrollTo({ top: 0, behavior: "instant" });

    // Update browser address bar
    if (pushToHistory) {
      window.history.pushState({ url }, "", url);
    }

    // Initialize the new chapter logic
    executeChapterInit(url);

    // Smoothly fade back in
    setTimeout(() => {
      if (overlay) {
        overlay.classList.remove("is-exiting");
        overlay.classList.add("is-loaded");
      }
      newMain.classList.add("is-active");
      isTransitioning = false;
    }, 100);
  } catch (err) {
    console.warn("SPA transition fallback to location.href:", err);
    if (audioInstance && !isNaN(audioInstance.currentTime) && !isRestoringTime) {
      sessionStorage.setItem("musicTime", audioInstance.currentTime.toString());
      sessionStorage.setItem("musicPlaying", (!audioInstance.paused).toString());
    }
    setTimeout(() => {
      window.location.href = url;
    }, 380);
  }
}

// Browser back and forward button support
window.addEventListener("popstate", () => {
  const filename = window.location.pathname.split("/").pop() || "index.html";
  navigateWithTransition(filename, false);
});
