let endingSlideshowTimer = null;
let endingTextSequenceTimer = null;

function initEndingPage() {
  const endingMontage = document.getElementById("endingMontage");
  const endingStars = document.getElementById("endingStars");
  const endingLine = document.getElementById("endingLine");
  const finalNote = document.getElementById("finalNote");

  if (!endingLine) return;

  if (endingSlideshowTimer) {
    clearInterval(endingSlideshowTimer);
    endingSlideshowTimer = null;
  }
  if (endingTextSequenceTimer) {
    clearTimeout(endingTextSequenceTimer);
    endingTextSequenceTimer = null;
  }

  const endingLines = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.endingLines)
    ? BirthdayConfig.endingLines
    : ["One last thing...", "Thank you for existing.", "Happy Birthday ❤️"];

  // 1. Spawns Twinkling Stars
  function spawnStars() {
    if (!endingStars) return;
    endingStars.innerHTML = "";
    const count = 45;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.width = `${0.1 + Math.random() * 0.2}rem`;
      star.style.height = star.style.width;
      star.style.animationDelay = `${Math.random() * -5}s`;
      star.style.animationDuration = `${2 + Math.random() * 4}s`;
      fragment.appendChild(star);
    }
    endingStars.appendChild(fragment);
  }

  // 2. Build Photo Montage Slideshow
  function photoBackground(photo, fallbackIndex) {
    if (photo) {
      return `url("${photo}")`;
    }
    const gradients = [
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #4a154b, #1a052e)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #1b0a2a, #030006)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #2a083d, #08020a)",
      "radial-gradient(circle at 50% 50%, rgba(20, 8, 22, 0.4) 0%, rgba(6, 3, 8, 0.8) 100%), linear-gradient(135deg, #3d002a, #0a0007)",
    ];
    return gradients[fallbackIndex % gradients.length];
  }

  function startSlideshow() {
    if (!endingMontage) return;
    endingMontage.innerHTML = "";
    
    // Gather all photos from configuration
    const photos = [];
    if (typeof BirthdayConfig !== "undefined") {
      if (BirthdayConfig.floatingMemories) {
        BirthdayConfig.floatingMemories.forEach(item => {
          if (item.photo) photos.push(item.photo);
        });
      }
    }

    const totalSlides = photos.length > 0 ? photos.length : 4;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < totalSlides; i++) {
      const frame = document.createElement("div");
      frame.className = "montage-photo";
      const photoPath = photos[i] || "";
      frame.style.setProperty("--photo-bg", photoBackground(photoPath, i));
      fragment.appendChild(frame);
    }
    endingMontage.appendChild(fragment);

    const slides = endingMontage.querySelectorAll(".montage-photo");
    if (slides.length === 0) return;

    let currentIndex = 0;
    slides[0].classList.add("is-active");

    endingSlideshowTimer = setInterval(() => {
      slides[currentIndex].classList.remove("is-active");
      currentIndex = (currentIndex + 1) % slides.length;
      
      slides[currentIndex].style.transition = "none";
      slides[currentIndex].style.transform = "scale(1.08)";
      void slides[currentIndex].offsetWidth;
      
      slides[currentIndex].style.transition = "";
      slides[currentIndex].classList.add("is-active");
    }, 6000);
  }

  function getEndingLineWithIcon(line) {
    if (!line) return "";
    if (line.includes("❤️")) {
      return `${line.replace("❤️", "")} <span style="color: #ff527c; display: inline-flex; align-items: center; vertical-align: middle; margin-left: 0.4rem; margin-top: -0.25rem;"><svg viewBox="0 0 24 24" fill="currentColor" style="width: 2.2rem; height: 2.2rem;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>`;
    }
    return line;
  }

  function playTextSequence() {
    let lineIndex = 0;

    const nextLine = () => {
      endingLine.classList.remove("is-visible");
      if (endingLine.innerHTML) {
        endingLine.classList.add("is-leaving");
      }

      setTimeout(() => {
        endingLine.classList.remove("is-leaving");
        
        if (lineIndex < endingLines.length) {
          endingLine.setAttribute("data-index", lineIndex + 1);
          endingLine.innerHTML = getEndingLineWithIcon(endingLines[lineIndex]);
          endingLine.classList.add("is-visible");
          lineIndex++;
          
          endingTextSequenceTimer = setTimeout(nextLine, 3600);
        } else {
          endingLine.innerHTML = "";
          setTimeout(() => {
            if (finalNote) {
              finalNote.classList.add("is-visible");
            }
          }, 2000);
        }
      }, 1600);
    };

    setTimeout(nextLine, 1200);
  }

  document.body.classList.add("is-dark");

  const restartExperienceBtn = document.getElementById("restartExperienceBtn");
  if (restartExperienceBtn) {
    restartExperienceBtn.onclick = () => {
      sessionStorage.clear();
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("index.html");
      } else {
        window.location.href = "index.html";
      }
    };
  }

  spawnStars();
  startSlideshow();
  playTextSequence();
}

window.initEndingPage = initEndingPage;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEndingPage);
} else {
  initEndingPage();
}
