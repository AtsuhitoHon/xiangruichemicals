// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!hamburger.contains(event.target) && !mobileMenu.contains(event.target)) {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
    }
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// 淡入動畫設定
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// 觀察所有需要動畫的元素
document.querySelectorAll('.fade-in-up').forEach(el => {
  observer.observe(el);
});

// 頁面載入完成後觸發動畫
window.addEventListener('load', () => {
  // 重新觸發hero區塊的打字機動畫
  restartHeroAnimation();
});

// 重新啟動hero動畫的函數
function restartHeroAnimation() {
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroCta = document.querySelector('.hero-cta');
  
  if (heroTitle && heroSubtitle && heroCta) {
    // 重設動畫
    heroTitle.style.animation = 'none';
    heroSubtitle.style.animation = 'none';
    heroCta.style.animation = 'none';
    
    // 重設初始狀態
    heroTitle.style.width = '0';
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(30px)';
    heroCta.style.opacity = '0';
    heroCta.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      heroTitle.style.animation = 'typing 2.5s steps(20, end) forwards, blink-caret 0.5s step-end infinite';
      heroSubtitle.style.animation = 'fadeInUp 1s ease-out 2.5s forwards';
      heroCta.style.animation = 'fadeInUp 1s ease-out 3s forwards';
    }, 100);
  }
}

// Stats counter animation
function animateCounter(element, target) {
  let count = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    
    // 格式化數字顯示
    let displayValue = Math.floor(count);
    if (target >= 100 && element.textContent.includes('%')) {
      element.textContent = displayValue + '%';
    } else if (target >= 100) {
      element.textContent = displayValue + '+';
    } else {
      element.textContent = displayValue;
    }
  }, 20);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-item h3');
      statNumbers.forEach(stat => {
        const originalText = stat.textContent;
        const targetValue = parseInt(originalText);
        if (targetValue) {
          animateCounter(stat, targetValue);
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// 等待DOM載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
  // 觀察統計區塊
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
  
  // Contact form submission
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('感謝您的諮詢！我們會盡快與您聯繫。');
    });
  }
});

// 手動重新啟動打字機動畫的函數
function restartTypewriter() {
  restartHeroAnimation();
}

// 平滑滾動到指定區塊
function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// 響應式導航功能（預留給未來的手機版選單）
function toggleMobileMenu() {
  const nav = document.querySelector('.mobile-nav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

// 節流函數，優化滾動性能
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// 視差滾動效果（如果需要）
function parallaxEffect() {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.parallax');
  
  parallaxElements.forEach(element => {
    const speed = element.dataset.speed || 0.5;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
}

// 使用節流優化滾動事件
const throttledScroll = throttle(() => {
  parallaxEffect();
}, 16); // 約60fps

// 如果有視差元素才添加滾動監聽
if (document.querySelectorAll('.parallax').length > 0) {
  window.addEventListener('scroll', throttledScroll);
}