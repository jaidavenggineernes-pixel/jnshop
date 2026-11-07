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
  --background: #f8fafc;
  --foreground: #0f172a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
}

/* Custom Clean Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Subtle pulse animation for AI button */
@keyframes softPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.04);
    box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.6);
  }
}

.ai-floating-btn {
  animation: softPulse 4s infinite ease-in-out;
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
