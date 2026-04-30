_cf_project := "mermaid-gantt"

# Default: list recipes
default:
    @just --list

# Start dev server (port 5173)
dev:
    bun run dev

# Type check (TypeScript + Svelte)
check:
    bun run check

# Production build (writes to build/)
build:
    bun run build

# Deploy to Cloudflare Pages production (mermaidgantt.xyz)
cf-deploy: build
    bunx wrangler pages deploy build --project-name {{_cf_project}} --branch main

# Deploy a preview branch to Cloudflare Pages
cf-deploy-preview branch="preview": build
    bunx wrangler pages deploy build --project-name {{_cf_project}} --branch {{branch}}

# Tail live Pages deployment logs
cf-tail:
    bunx wrangler pages deployment tail --project-name {{_cf_project}}
