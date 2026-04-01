(function () {
  function initMermaid() {
    if (!window.mermaid) {
      return;
    }

    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default"
    });

    var nodes = document.querySelectorAll(".mermaid");
    if (!nodes.length) {
      return;
    }

    window.mermaid.run({ nodes: nodes });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMermaid);
  } else {
    initMermaid();
  }
})();
