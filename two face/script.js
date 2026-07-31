// WAYNE ENTERPRISES - MAIN WEBSITE JS ENGINE

document.addEventListener('DOMContentLoaded', () => {

  // 1. SPOTLIGHT MASK REVEAL EFFECT (HERO)
  const heroSection = document.getElementById('hero');
  const maskLayer = document.getElementById('mask-layer');
  const spotlightHalo = document.getElementById('spotlight-halo');

  let targetX = window.innerWidth * 0.65;
  let targetY = window.innerHeight * 0.50;
  let currentX = targetX;
  let currentY = targetY;
  let isHovered = false;
  const spotlightRadius = 160;

  function updateMask() {
    const maskStyle = `radial-gradient(circle ${spotlightRadius}px at ${currentX}px ${currentY}px, black 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, transparent 100%)`;
    maskLayer.style.maskImage = maskStyle;
    maskLayer.style.webkitMaskImage = maskStyle;

    spotlightHalo.style.left = `${currentX}px`;
    spotlightHalo.style.top = `${currentY}px`;
  }

  function animateSpotlight() {
    const ease = isHovered ? 0.12 : 0.04;
    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    if (!isHovered) {
      const time = Date.now() * 0.0012;
      targetX = (window.innerWidth * 0.65) + Math.cos(time) * 50;
      targetY = (window.innerHeight * 0.50) + Math.sin(time * 1.3) * 35;
    }

    updateMask();
    requestAnimationFrame(animateSpotlight);
  }

  if (heroSection && maskLayer && spotlightHalo) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      isHovered = true;
    });

    heroSection.addEventListener('mouseleave', () => { isHovered = false; });

    heroSection.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = heroSection.getBoundingClientRect();
        targetX = e.touches[0].clientX - rect.left;
        targetY = e.touches[0].clientY - rect.top;
        isHovered = true;
      }
    }, { passive: true });

    requestAnimationFrame(animateSpotlight);
  }


  // 2. CANVAS FLOATING GOLD PARTICLES
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 40;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3 - 0.2;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }


  // 3. MOBILE MENU TOGGLE
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('active');
      if (menuIcon) menuIcon.classList.toggle('hidden', isOpen);
      if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
    });
  }


  // 4. WEB AUDIO FEEDBACK TONES
  const soundToggle = document.getElementById('sound-toggle');
  const iconOff = document.getElementById('sound-icon-off');
  const iconOn = document.getElementById('sound-icon-on');
  let soundEnabled = false;
  let audioCtx = null;

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (iconOff) iconOff.classList.toggle('hidden', soundEnabled);
      if (iconOn) iconOn.classList.toggle('hidden', !soundEnabled);

      if (soundEnabled && !audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    });
  }

  function playTone(freq = 440, duration = 0.05) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => playTone(600, 0.03));
    el.addEventListener('click', () => playTone(850, 0.06));
  });


  // 5. WEB3FORMS AJAX SUBMISSION HANDLER
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.innerHTML = "TRANSMITTING SIGNAL...";
      submitBtn.disabled = true;

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let resJson = await response.json();
        if (response.status == 200) {
          alert('🦇 Bat-Signal Transmitted Successfully! Message sent to Wayne Security.');
          contactForm.reset();
        } else {
          alert(resJson.message || 'Signal Transmission Failed.');
        }
      })
      .catch(error => {
        alert('Transmission Failed! Batcomputer Offline.');
      })
      .then(function() {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      });
    });
  }

});