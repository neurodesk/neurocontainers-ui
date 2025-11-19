# NeuroContainers UI Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only if the information in these instructions is incomplete or found to be in error.**

NeuroContainers UI is a Next.js 15.3.3 web application for building containerized neuroimaging tools. It provides a visual interface to create, customize, and validate container recipes using YAML configuration files. The application uses Pyodide for client-side Python execution and integrates with the NeuroContainers GitHub repository.

## Working Effectively

### Prerequisites and Setup
- **Primary (Recommended):** Install Bun package manager: `curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH"`
- **Alternative:** Node.js v20+ and npm v10+ (has network restrictions for builds - see Build Process section)

### Bootstrap and Install Dependencies
- **Primary:** `bun install` -- takes ~8-50 seconds (faster with cache). NEVER CANCEL. Set timeout to 90+ seconds.
- **Alternative:** `npm install` -- takes ~8-51 seconds (faster with cache). NEVER CANCEL. Set timeout to 90+ seconds.

### Build Process
**CRITICAL BUILD REQUIREMENTS:**
- **In Network-Restricted Environments:** Both `bun run build` and `npm run build` FAIL due to Google Fonts (fonts.googleapis.com) access requirements.
- **Workaround Required:** If build fails with Google Fonts errors, apply this temporary fix to `components/fonts.ts`:

```typescript
// Replace the entire contents of components/fonts.ts with:
export const GeistSans = {
    variable: "--font-geist-sans",
    className: "font-sans",
};

export const GeistMono = {
    variable: "--font-geist-mono", 
    className: "font-mono",
};
```

- **After Applying Workaround:**
  - `bun run build` -- takes ~29 seconds. NEVER CANCEL. Set timeout to 60+ minutes.  
  - `npm run build` -- takes ~29 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
- **Output:** Static export to `./out/` directory for GitHub Pages deployment.
- **Always restore fonts.ts to original state after testing builds** (original uses Google Fonts imports).

### Development Server
- **Primary:** `bun run dev` -- starts in ~1.8 seconds on http://localhost:3000
- **Alternative:** `npm run dev` -- starts in ~1.5 seconds on http://localhost:3000  
- **Google Fonts Network Errors:** Development server works even with Google Fonts network errors - fonts fail gracefully.
- **NEVER CANCEL:** Development server runs indefinitely. Use appropriate session management.

### Linting and Code Quality
- `bun run lint` -- takes ~2.3 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- Alternative: `npm run lint` -- takes ~4.5 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- **Always run linting before committing changes** or the CI (.github/workflows/deploy.yaml) will fail.

### Testing
- **Unit Tests:** `bun run test` or `npm run test` -- runs Jest unit tests (~1.5 seconds). All tests should pass.
- **Test Watch Mode:** `bun run test:watch` or `npm run test:watch` -- runs tests in watch mode for development.
- **Test Coverage:** `bun run test:coverage` or `npm run test:coverage` -- generates test coverage reports.
- **E2E Tests:** `bun run test:e2e` or `npm run test:e2e` -- runs Playwright end-to-end tests.
- **E2E UI Mode:** `bun run test:e2e:ui` or `npm run test:e2e:ui` -- runs Playwright tests with UI for debugging.
- **All Tests:** `bun run test:all` or `npm run test:all` -- runs both unit and E2E tests.
- **Always run tests after making code changes** to ensure no regressions.

## Validation Scenarios

**CRITICAL: After making any changes, ALWAYS test the complete user workflow:**

1. **Start Development Server:** Run `bun run dev` and verify it starts in ~1.8 seconds on http://localhost:3000
2. **Test Homepage Load:** Navigate to homepage and verify it displays:
   - Header with "NeuroContainers Builder" title, navigation buttons, and theme toggle
   - "Create New Container" and "Upload Existing YAML" buttons in main content
   - Recent Containers section (initially empty, shows "0 containers recently worked on")
   - Published Containers section (may show "Error loading recipes" due to network restrictions - this is normal)
   - Footer with Neurodesk ecosystem links (neurodesk.org, containers repo, builder UI repo)
3. **Test Container Creation Workflow:** Click "Create New Container" and verify:
   - Navigation to builder interface with URL hash (e.g., `#/untitled-2025-08-07`)
   - Header shows "Saved Locally" status and "Unpublished Container" warning
   - Three main sections visible: "Basic Info", "Build Recipe", "Validate"
   - Basic Info section shows required field validation errors for name, version, documentation, categories
   - Build Recipe section shows Ubuntu LTS base image selection and 2 default directives (Deploy, Test)
   - Validate section shows "Load Pyodide" button and Pyodide/Container Builder status
4. **Test UI Responsiveness:** Verify forms, buttons, navigation, and interactions work correctly
5. **Test Build Output:** Run build command and verify `./out/` directory contains:
   - `index.html` (main application)
   - `404.html` (error page)
   - `_next/` directory with static assets
   - `favicon.ico` and other static files

**Expected Network Errors (Normal in Restricted Environments):**
- GitHub API calls may fail with "ERR_BLOCKED_BY_CLIENT" or "Failed to fetch" errors
- Google Fonts may fail to load during build (use font workaround in Build Process section)
- Published Containers section will show "Error loading recipes" 
- These errors do not prevent core container building functionality from working

## Architecture and Navigation

### Core Application Structure
- **Main Application:** `app/page.tsx` - manages state, navigation, and local storage
- **Components:** 
  - `components/metadata.tsx` - Basic Info section with container metadata
  - `components/neurodocker.tsx` - Build Recipe section with Neurodocker directives
  - `components/validate.tsx` - Validate section for recipe testing
  - `components/directives/` - Individual directive components (install, environment, test, etc.)
- **Business Logic:** `lib/` directory contains GitHub integration, Python builder, and utilities
- **Types:** `types/` directory contains TypeScript definitions

### Key Application Workflow
1. **Homepage** - Landing page with create/upload options and container library
2. **Basic Info** - Container metadata, architectures, categories, documentation, licensing
3. **Build Recipe** - Base image selection and Neurodocker build directives
4. **Validate** - Recipe validation using Pyodide-based Python builder

### Important File Patterns
- Path aliases: `@/*` maps to repository root
- Components use PascalCase, utilities use camelCase
- Directive components in `/components/directives/` follow naming pattern: `[directive-name].tsx`

## Build Configuration Details

### Next.js Configuration (`next.config.ts`)
- Static export enabled for GitHub Pages deployment
- Optional base path from `PAGES_BASE_PATH` environment variable
- TypeScript with strict mode enabled

### Styling and UI
- Tailwind CSS for styling with custom theme configuration
- Heroicons for iconography
- Dark/light theme support via `lib/ThemeContext.tsx`

### GitHub Integration
- Uses GitHub API for browsing existing container recipes
- No authentication required for public repository access
- Service layer with caching in `lib/github.ts`
- GitHub workflows: `deploy.yaml` for Pages deployment, `claude.yml` for AI assistance

## Common Development Commands Reference

### Full Development Cycle
```bash
# Setup (first time)
curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH"
bun install  # 8-50s (faster with cache), timeout 90s

# Daily development
bun run dev        # Start development server (~1.8s)
bun run lint       # Check code quality (~2.3s, timeout 30s)
bun run test       # Run unit tests (~1.5s)
bun run build      # Build for production (~29s, timeout 60+ minutes)
```

### Alternative with npm (Network-Restricted Build Support)
```bash
# Setup
npm install        # 8-51s (faster with cache), timeout 90s

# Development
npm run dev        # Start development server (~1.5s)
npm run lint       # Check code quality (~4.5s, timeout 30s)
npm run test       # Run unit tests (~1.5s)
npm run build      # Build for production (~29s, timeout 60+ minutes)
                   # Requires fonts.ts workaround in network-restricted environments
```

### Network-Restricted Environment Build Fix
```bash
# If build fails with Google Fonts errors, apply this temporary workaround:
# Replace components/fonts.ts content with local font fallbacks (see Build Process section)
# Run build, then restore original fonts.ts
```

## Troubleshooting

### Build Failures
- **Google Fonts Error:** Both `bun run build` and `npm run build` fail in network-restricted environments
  - **Solution:** Apply fonts.ts workaround (see Build Process section), run build, then restore original file
  - **Symptoms:** "Failed to fetch `Geist` from Google Fonts" or "getaddrinfo EAI_AGAIN fonts.googleapis.com"
- **Network Timeouts:** Increase timeout values - builds can take up to 29 seconds
- **Dependencies Issues:** Remove `node_modules` and `bun.lock`/`package-lock.json`, then reinstall

### Development Server Issues  
- **Port 3000 in use:** Next.js will automatically try port 3001, 3002, etc.
- **Network Errors in Console:** GitHub API and Google Fonts errors are normal in restricted environments
- **Application Still Functions:** UI loads and works despite network errors - they're cosmetic

### Code Quality
- **ESLint Errors:** Run linting command to identify and fix issues before committing
- **TypeScript Errors:** Check `tsconfig.json` configuration and type definitions in `types/`
- **Build Success:** Ensure build completes successfully before considering code quality validation complete

## Repository Structure Reference

### Root Directory
```
.
├── .github/           # GitHub workflows and configurations
├── app/               # Next.js app directory (page.tsx, layout.tsx, globals.css)
├── components/        # React components (metadata, recipe, validate, directives/)
├── lib/               # Business logic (builder, github, python, utilities)
├── types/             # TypeScript type definitions
├── public/            # Static assets
├── scripts/           # Utility scripts (update-miniconda-versions.py)
├── package.json       # Dependencies and scripts
├── next.config.ts     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
├── eslint.config.mjs  # ESLint configuration
├── bun.lock          # Bun lockfile
└── CLAUDE.md         # Claude AI development context
```

### Important Configuration Files
- `package.json` - Project dependencies and scripts
- `next.config.ts` - Static export and base path configuration  
- `tsconfig.json` - TypeScript compilation settings with path aliases
- `eslint.config.mjs` - Next.js and TypeScript ESLint rules

This application successfully builds, runs, and provides full container building functionality for the neuroimaging community.