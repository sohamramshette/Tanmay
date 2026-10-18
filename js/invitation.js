function initInvitationPage() {
  // ==========================================================================
  // Part 1: Confession Time Lock Drum Roller Logic (Chapter 0)
  // ==========================================================================
  const lockSection = document.getElementById("lockSection");
  if (!lockSection) return;
  const invitationSection = document.getElementById("invitationSection");
  const lockCard = document.getElementById("lockCard");
  const lockBadge = document.getElementById("lockBadge");
  const lockIcon = document.getElementById("lockIcon");
  const lockFeedback = document.getElementById("lockFeedback");
  const selectedTimeText = document.getElementById("selectedTimeText");
  const unlockBtn = document.getElementById("unlockBtn");

  const hourWheel = document.getElementById("hourWheel");
  const hourWheelContent = document.getElementById("hourWheelContent");
  const hourUpBtn = document.getElementById("hourUpBtn");
  const hourDownBtn = document.getElementById("hourDownBtn");

  const minuteWheel = document.getElementById("minuteWheel");
  const minuteWheelContent = document.getElementById("minuteWheelContent");
  const minUpBtn = document.getElementById("minUpBtn");
  const minDownBtn = document.getElementById("minDownBtn");

  const ITEM_HEIGHT = 48; // Exactly 48px height per digit
  let selectedHour = "06";
  let selectedMinute = "30";
  let wrongAttempts = 0;
  let isUnlocked = false;

  const targetPin = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.confessionPin)
    ? String(BirthdayConfig.confessionPin)
    : "1209";

  const wrongMessages = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.confessionWrongMessages)
    ? BirthdayConfig.confessionWrongMessages
    : [
        "Not quite that time, Golyaa... think back to that moment 💕",
        "Close, but not that exact minute! 🤭",
        "Think of when your hearts connected... 🌙"
      ];

  // 1. Generate Hour list: 01 to 12
  const hours = [];
  for (let i = 1; i <= 12; i++) {
    hours.push(String(i).padStart(2, "0"));
  }

  // 2. Generate Minute list: 00 to 59
  const minutes = [];
  for (let i = 0; i <= 59; i++) {
    minutes.push(String(i).padStart(2, "0"));
  }

  // 3. Render Hour items
  if (hourWheelContent && hourWheel) {
    hours.forEach((h, idx) => {
      const el = document.createElement("div");
      el.className = "roller-digit";
      el.textContent = h;
      el.setAttribute("data-index", idx);
      el.setAttribute("role", "option");
      el.addEventListener("click", () => {
        if (typeof startGlobalMusic === "function") startGlobalMusic();
        hourWheel.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
      });
      hourWheelContent.appendChild(el);
    });
  }

  // 4. Render Minute items
  if (minuteWheelContent && minuteWheel) {
    minutes.forEach((m, idx) => {
      const el = document.createElement("div");
      el.className = "roller-digit";
      el.textContent = m;
      el.setAttribute("data-index", idx);
      el.setAttribute("role", "option");
      el.addEventListener("click", () => {
        if (typeof startGlobalMusic === "function") startGlobalMusic();
        minuteWheel.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
      });
      minuteWheelContent.appendChild(el);
    });
  }

  // 5. Update highlights and active values
  function updateHighlight(container, activeIndex) {
    if (!container) return;
    const items = container.querySelectorAll(".roller-digit");
    items.forEach((item, idx) => {
      if (idx === activeIndex) {
        item.classList.add("is-active");
        item.setAttribute("aria-selected", "true");
      } else {
        item.classList.remove("is-active");
        item.removeAttribute("aria-selected");
      }
    });
  }

  function updateReadout() {
    if (selectedTimeText) {
      selectedTimeText.textContent = `${selectedHour} : ${selectedMinute}`;
    }
  }

  let hourScrollTimer = null;
  function handleHourScroll() {
    if (!hourWheel) return;
    const idx = Math.min(hours.length - 1, Math.max(0, Math.round(hourWheel.scrollTop / ITEM_HEIGHT)));
    selectedHour = hours[idx];
    updateHighlight(hourWheelContent, idx);
    updateReadout();

    clearTimeout(hourScrollTimer);
    hourScrollTimer = setTimeout(() => {
      checkAutoMatch();
    }, 450);
  }

  let minuteScrollTimer = null;
  function handleMinuteScroll() {
    if (!minuteWheel) return;
    const idx = Math.min(minutes.length - 1, Math.max(0, Math.round(minuteWheel.scrollTop / ITEM_HEIGHT)));
    selectedMinute = minutes[idx];
    updateHighlight(minuteWheelContent, idx);
    updateReadout();

    clearTimeout(minuteScrollTimer);
    minuteScrollTimer = setTimeout(() => {
      checkAutoMatch();
    }, 450);
  }

  if (hourWheel) {
    hourWheel.addEventListener("scroll", handleHourScroll, { passive: true });
    hourWheel.addEventListener("pointerdown", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
    }, { passive: true });
  }
  if (minuteWheel) {
    minuteWheel.addEventListener("scroll", handleMinuteScroll, { passive: true });
    minuteWheel.addEventListener("pointerdown", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
    }, { passive: true });
  }

  // 6. Up / Down Step Arrows
  if (hourUpBtn && hourWheel) {
    hourUpBtn.addEventListener("click", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
      const currentIdx = Math.round(hourWheel.scrollTop / ITEM_HEIGHT);
      const targetIdx = currentIdx <= 0 ? hours.length - 1 : currentIdx - 1;
      hourWheel.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: "smooth" });
    });
  }
  if (hourDownBtn && hourWheel) {
    hourDownBtn.addEventListener("click", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
      const currentIdx = Math.round(hourWheel.scrollTop / ITEM_HEIGHT);
      const targetIdx = currentIdx >= hours.length - 1 ? 0 : currentIdx + 1;
      hourWheel.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: "smooth" });
    });
  }

  if (minUpBtn && minuteWheel) {
    minUpBtn.addEventListener("click", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
      const currentIdx = Math.round(minuteWheel.scrollTop / ITEM_HEIGHT);
      const targetIdx = currentIdx <= 0 ? minutes.length - 1 : currentIdx - 1;
      minuteWheel.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: "smooth" });
    });
  }
  if (minDownBtn && minuteWheel) {
    minDownBtn.addEventListener("click", () => {
      if (typeof startGlobalMusic === "function") startGlobalMusic();
      const currentIdx = Math.round(minuteWheel.scrollTop / ITEM_HEIGHT);
      const targetIdx = currentIdx >= minutes.length - 1 ? 0 : currentIdx + 1;
      minuteWheel.scrollTo({ top: targetIdx * ITEM_HEIGHT, behavior: "smooth" });
    });
  }

  // 7. Initial Drum Positioning (Start at 06:30 mystery time)
  requestAnimationFrame(() => {
    setTimeout(() => {
      const initialHourIdx = 5; // "06"
      const initialMinuteIdx = 30; // "30"
      if (hourWheel) {
        hourWheel.scrollTop = initialHourIdx * ITEM_HEIGHT;
        updateHighlight(hourWheelContent, initialHourIdx);
      }
      if (minuteWheel) {
        minuteWheel.scrollTop = initialMinuteIdx * ITEM_HEIGHT;
        updateHighlight(minuteWheelContent, initialMinuteIdx);
      }
      selectedHour = hours[initialHourIdx];
      selectedMinute = minutes[initialMinuteIdx];
      updateReadout();
    }, 150);
  });

  // 8. Validate PIN & Unlock Sequence
  function isCorrectTime() {
    const currentPin = `${selectedHour}${selectedMinute}`;
    return currentPin === targetPin || (parseInt(selectedHour, 10) === 12 && parseInt(selectedMinute, 10) === 9);
  }

  function handleUnlockAttempt() {
    if (isUnlocked) return;

    if (isCorrectTime()) {
      triggerUnlockSuccess();
    } else {
      triggerUnlockFail();
    }
  }

  function checkAutoMatch() {
    if (isUnlocked) return;
    if (isCorrectTime()) {
      triggerUnlockSuccess();
    }
  }

  function triggerUnlockSuccess() {
    if (isUnlocked) return;
    isUnlocked = true;

    // Visual Lock Open Animation
    if (lockBadge) lockBadge.classList.add("is-unlocked");
    if (lockIcon) lockIcon.textContent = "🔓";

    // Golden sparkles celebration
    if (lockBadge) {
      spawnGoldSparkles(lockBadge);
    }

    // Continue playing global music seamlessly
    if (typeof startGlobalMusic === "function") {
      startGlobalMusic();
    }

    // Feedback message
    if (lockFeedback) {
      lockFeedback.className = "lock-feedback is-success";
      lockFeedback.textContent = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.confessionSuccessMessage)
        ? BirthdayConfig.confessionSuccessMessage
        : "That's the exact moment! ❤️";
    }

    if (unlockBtn) {
      unlockBtn.disabled = true;
      const textSpan = unlockBtn.querySelector(".unlock-btn-text");
      if (textSpan) textSpan.textContent = "Unlocked! 💖";
    }

    // Smooth transition to Chapter 1 Invitation
    setTimeout(() => {
      if (lockSection) {
        lockSection.classList.add("fade-out");
      }
      setTimeout(() => {
        if (lockSection) lockSection.style.display = "none";
        if (invitationSection) {
          invitationSection.classList.remove("is-hidden");
          invitationSection.classList.add("is-revealed");
        }
        if (typeof updateProgressIndicator === "function") {
          updateProgressIndicator();
        }
      }, 650);
    }, 1200);
  }

  function triggerUnlockFail() {
    wrongAttempts++;
    if (lockCard) {
      lockCard.classList.remove("shake");
      void lockCard.offsetWidth; // Force CSS reflow to restart animation
      lockCard.classList.add("shake");
    }

    if (lockFeedback) {
      lockFeedback.className = "lock-feedback is-error";
      if (wrongAttempts >= 3) {
        lockFeedback.textContent = "Hint: It was a little past midnight... 🌙 (12:09)";
      } else {
        const msg = wrongMessages[(wrongAttempts - 1) % wrongMessages.length];
        lockFeedback.textContent = msg;
      }
    }
  }

  if (unlockBtn) {
    unlockBtn.addEventListener("click", handleUnlockAttempt);
  }

  // ==========================================================================
  // Part 2: Chapter 1 Gift Box Interaction
  // ==========================================================================
  const openGiftButton = document.getElementById("openGiftButton");

  if (openGiftButton) {
    openGiftButton.addEventListener("click", () => {
      // Prevent double trigger
      if (openGiftButton.classList.contains("is-open")) return;
      
      // 1. Play Opening Animation
      openGiftButton.classList.add("is-open");

      // 2. Spawn golden sparkles rising from box center
      const boxContainer = openGiftButton.querySelector(".luxury-gift");
      if (boxContainer) {
        spawnGoldSparkles(boxContainer);
      }

      // 3. Play continuous background music
      if (typeof startGlobalMusic === "function") {
        startGlobalMusic();
      }

      // 4. Navigate to next chapter with an elegant transition delay
      setTimeout(() => {
        if (typeof navigateWithTransition === "function") {
          navigateWithTransition("gift.html");
        } else {
          window.location.href = "gift.html";
        }
      }, 2200);
    });
  }

  // Shared Sparkle Generator
  function spawnGoldSparkles(container) {
    if (!container) return;
    const sparklesCount = 26;
    const colors = ["#ffc837", "#ff9f43", "#fff3cc", "#ffd700", "#ff70ad", "#ff527c"];
    const symbols = ["✦", "✧", "•", "✨", "❤️"];
    
    for (let i = 0; i < sparklesCount; i++) {
      const sparkle = document.createElement("span");
      sparkle.className = "gold-sparkle";
      sparkle.textContent = symbols[i % symbols.length];
      
      const startX = (Math.random() - 0.5) * 50;
      const startY = (Math.random() - 0.5) * 20;
      
      sparkle.style.setProperty("--startX", `${startX}px`);
      sparkle.style.setProperty("--startY", `${startY}px`);
      
      const moveX = (Math.random() - 0.5) * 140;
      const moveY = -120 - Math.random() * 120;
      
      sparkle.style.setProperty("--moveX", `${moveX}px`);
      sparkle.style.setProperty("--moveY", `${moveY}px`);
      
      sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.fontSize = `${0.7 + Math.random() * 0.8}rem`;
      sparkle.style.animationDuration = `${1.2 + Math.random() * 1.1}s`;
      sparkle.style.animationDelay = `${Math.random() * 0.35}s`;
      
      container.appendChild(sparkle);
      
      setTimeout(() => sparkle.remove(), 2500);
    }
  }
}

window.initInvitationPage = initInvitationPage;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInvitationPage);
} else {
  initInvitationPage();
}
