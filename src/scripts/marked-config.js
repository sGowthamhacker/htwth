// Configure marked.js options
window.addEventListener('DOMContentLoaded', () => {
  if (typeof marked !== 'undefined') {
    marked.use({
      breaks: true, // Enable line breaks on single newline
      gfm: true     // Enable GitHub Flavored Markdown
    });
  }
});
