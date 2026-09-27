// Formats a Writing post.
// Published posts are pre-rendered by tools/publish.py (the text is already in the page),
// so this only draws equations. Drafts (not yet published) are rendered here from Markdown.
(function () {
  const target = document.getElementById('post-body');
  if (!target) return;

  if (!target.hasAttribute('data-prerendered')) renderDraft(target);

  // Draw equations with KaTeX, loaded only when the post has math.
  const spans = target.querySelectorAll('.math');
  if (!spans.length) return;
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
  document.head.appendChild(css);
  const js = document.createElement('script');
  js.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
  js.onload = () => {
    spans.forEach((el) => {
      try {
        window.katex.render(el.getAttribute('data-tex'), el, {
          displayMode: el.classList.contains('math--display'), throwOnError: false,
        });
      } catch (e) { /* leave the raw TeX visible */ }
    });
  };
  document.head.appendChild(js);

  function renderDraft(el) {
    const source = document.getElementById('post-md');
    if (!source || !window.marked) return;
    const lines = source.textContent.replace(/^\n+|\s+$/g, '').split('\n');
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
    let md = lines.map((l) => l.slice(indent)).join('\n');

    // Inline math follows Pandoc's rule so dollar amounts stay text ("$3 million and $10 million").
    const math = [];
    md = md
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `@@MATH${math.push({ tex, display: true }) - 1}@@`)
      .replace(/(^|[^\\$\w])\$(?!\s)([^$\n]*?[^\s\\$])\$(?!\d)/g,
        (_, pre, tex) => `${pre}@@MATH${math.push({ tex, display: false }) - 1}@@`);

    if (window.markedFootnote) window.marked.use(window.markedFootnote());
    const html = window.marked.parse(md, { gfm: true });
    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    el.innerHTML = html.replace(/@@MATH(\d+)@@/g, (_, i) => {
      const { tex, display } = math[+i];
      return `<span class="math${display ? ' math--display' : ''}" data-tex="${esc(tex)}">${esc(tex)}</span>`;
    });
    el.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
    el.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; img.decoding = 'async'; });
    const words = el.textContent.trim().split(/\s+/).length;
    const rt = document.querySelector('[data-readtime]');
    if (rt) rt.textContent = ` · ${Math.max(1, Math.round(words / 230))} min read`;
  }
})();
