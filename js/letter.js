function initLetterPage() {
  const paperCard = document.querySelector(".paper-card");
  const typedLetter = document.getElementById("typedLetter");
  const letterSignature = document.querySelector(".letter-signature");
  const surpriseButton = document.getElementById("surpriseButton");

  if (!typedLetter) return;

  typedLetter.textContent = "";
  typedLetter.classList.remove("typing-done");
  if (paperCard) paperCard.classList.remove("is-visible");
  if (letterSignature) {
    letterSignature.textContent = "";
    letterSignature.classList.remove("is-visible");
  }
  if (surpriseButton) {
    surpriseButton.classList.remove("is-visible");
  }

  const letterText = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.letterText)
    ? BirthdayConfig.letterText
    : "Hey, my favourite girl 🥹💗\n\nI just want you to know that you mean so much to me. Your smile makes my day better, and having you in my life is something I'll always be grateful for. 🫶🏻💕\n\nNo matter what, you’ll always have a special place in my heart. I love you so much ❤️🧿";

  const signatureText = (typeof BirthdayConfig !== "undefined" && BirthdayConfig.letterSignature)
    ? BirthdayConfig.letterSignature
    : "Always with lots of love ❤️";

  let typingTimeout = null;

  // 1. Reveal Paper Card initially
  setTimeout(() => {
    if (paperCard) {
      paperCard.classList.add("is-visible");
      // Start typing after card arrives
      setTimeout(startTypewriter, 800);
    }
  }, 300);

  function startTypewriter() {
    let index = 0;
    let lastScrollHeight = document.documentElement.scrollHeight;
    
    // Smooth scroll typing context on mobile if page layout expands
    const autoScroll = () => {
      const currentHeight = document.documentElement.scrollHeight;
      if (currentHeight > lastScrollHeight) {
        window.scrollTo({
          top: currentHeight,
          behavior: "smooth"
        });
        lastScrollHeight = currentHeight;
      }
    };

    const type = () => {
      typedLetter.textContent = letterText.slice(0, index);
      index += 1;

      if (index <= letterText.length) {
        const delay = letterText[index - 1] === "." || letterText[index - 1] === "," ? 150 : (30 + Math.random() * 25);
        
        if (index % 6 === 0 && window.innerHeight < 780) {
          autoScroll();
        }

        typingTimeout = setTimeout(type, delay);
      } else {
        // Typing finished
        typedLetter.classList.add("typing-done");
        revealSignatureAndButton();
      }
    };

    type();
  }

  function revealSignatureAndButton() {
    if (letterSignature) {
      letterSignature.textContent = signatureText;
      letterSignature.classList.add("is-visible");
    }

    setTimeout(() => {
      if (surpriseButton) {
        surpriseButton.classList.add("is-visible");
        
        // Smooth scroll to make sure button is visible on mobile
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 800);
  }

  // Handle transition to next page
  if (surpriseButton) {
    surpriseButton.onclick = () => {
      if (typeof navigateWithTransition === "function") {
        navigateWithTransition("surprise.html");
      } else {
        window.location.href = "surprise.html";
      }
    };
  }
}

window.initLetterPage = initLetterPage;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLetterPage);
} else {
  initLetterPage();
}
