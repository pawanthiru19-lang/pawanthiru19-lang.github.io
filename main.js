// Footer year
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Show a hairline under the sticky header once the page has scrolled.
const header = document.querySelector('.site-header');
if (header) {
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// Scroll reveals. Single blocks rise in; groups rise in with a short stagger.
// Each fires once — re-animating on every scroll-by fights the reader.
const singles = document.querySelectorAll(
  '.path__title, .section__title, .page-head__note, .jump, .roles > .role, .research-list > .role, .posts > li, .posts-empty, .post__head, .prose'
);
const groups = document.querySelectorAll('.strengths, .path__list, .footer__inner');

singles.forEach((el) => el.setAttribute('data-reveal', ''));
groups.forEach((group) => {
  group.setAttribute('data-stagger', '');
  [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
});

const reveal = (el) => {
  el.classList.add('is-visible');
  // After the stagger has played, drop the delays so hover feels instant.
  if (el.hasAttribute('data-stagger')) {
    setTimeout(() => el.classList.add('is-done'), 70 * el.children.length + 700);
  }
};

const targets = [...singles, ...groups];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach(reveal);
}
