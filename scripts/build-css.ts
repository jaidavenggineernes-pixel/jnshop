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
  --background: #faf9f6;
  --foreground: #1c1917;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-serif: "Iowan Old Style", "Apple Garamond", "Baskerville", "Times New Roman", "Droid Serif", Times, Source Serif Pro, serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* Modern Web Guidance: Dialog & Top Layer UI */
dialog:modal {
  overscroll-behavior: contain;
}
dialog::backdrop {
  overflow: hidden;
  overscroll-behavior: contain;
  background-color: rgba(28, 25, 23, 0.45);
  backdrop-filter: blur(6px);
}

/* Custom Clean Editorial Scrollbars */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a8a29e;
}

/* Subtle warm breathing animation for Concierge button */
@keyframes warmBreathe {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px -5px rgba(28, 25, 23, 0.18);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 16px 32px -8px rgba(28, 25, 23, 0.28);
  }
}

.ai-floating-btn {
  animation: warmBreathe 4s infinite ease-in-out;
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
