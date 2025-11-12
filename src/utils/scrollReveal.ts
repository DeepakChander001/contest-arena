/**
 * Scroll Reveal Utility
 * Adds reveal animations to elements with .scroll-reveal class
 */

export const initScrollReveal = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll-reveal class
  const elements = document.querySelectorAll('.scroll-reveal');
  elements.forEach(el => {
    // Check if element is already in viewport on load
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isInViewport) {
      // Immediately reveal elements already in viewport
      el.classList.add('revealed');
    } else {
      // Observe elements not yet in viewport
      observer.observe(el);
    }
  });
};

// Auto-initialize on DOM load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
}

// Export for manual initialization if needed
export default initScrollReveal;

