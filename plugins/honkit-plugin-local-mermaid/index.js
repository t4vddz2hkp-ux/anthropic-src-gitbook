function escapeHtml(source) {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = {
  book: {
    assets: "./assets",
    js: ["mermaid.min.js", "mermaid-init.js"],
    css: ["mermaid.css"]
  },
  ebook: {
    assets: "./assets",
    js: ["mermaid.min.js", "mermaid-init.js"],
    css: ["mermaid.css"]
  },
  hooks: {
    "page:before": (page) => {
      page.content = page.content.replace(
        /```mermaid\s*\n([\s\S]*?)```/g,
        (_, source) => `<div class="mermaid">\n${escapeHtml(source.trimEnd())}\n</div>`
      );
      return page;
    }
  }
};
