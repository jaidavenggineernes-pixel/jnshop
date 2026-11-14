import { compile } from "@tailwindcss/node";
import fs from "fs";
import path from "path";

function getAllSourceFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(full));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

async function buildCss() {
  const baseInputCss = `@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #18181b;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

button:not(:disabled),
[role="button"]:not([aria-disabled="true"]),
select:not(:disabled),
summary {
  cursor: pointer;
}

button:disabled,
select:disabled {
  cursor: not-allowed;
}

:focus-visible {
  outline: 2px solid #166534;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Modern Web Guidance: Dialog & Top Layer UI */
dialog:modal {
  overscroll-behavior: contain;
}
dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
  background-color: rgba(24, 24, 27, 0.45);
  backdrop-filter: blur(4px);
}

/* Studio Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d4d4d8;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}
`;

  const files = getAllSourceFiles(path.resolve("src"));
  const candidates = new Set<string>();
  const candidateRegex = /[a-zA-Z0-9_\-\/\[\]%#.:]+/g;

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    const matches = content.match(candidateRegex) || [];
    for (const m of matches) candidates.add(m);
  }

  const compiler = await compile(baseInputCss, {
    base: path.resolve("."),
    onDependency: () => {},
  });

  const compiledCss = compiler.build(Array.from(candidates));
  fs.writeFileSync(path.resolve("src/app/globals.css"), compiledCss, "utf8");
  console.log(`✓ Tailwind CSS generated successfully (${compiledCss.length} bytes) to src/app/globals.css`);
}

buildCss().catch((err) => {
  console.error("Failed to build CSS:", err);
  process.exit(1);
});
