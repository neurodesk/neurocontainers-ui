# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js web application for building Neurocontainers - containerized neuroimaging tools. It provides a visual interface to create, customize, and validate container recipes using YAML configuration files.

## Common Development Commands

- `bun dev` - Start development server
- `bun run build` - Build for production  
- `bun lint` - Run ESLint

## Architecture Overview

### Core Data Flow
The application centers around `ContainerRecipe` objects (defined in `components/common.ts`) which represent container build configurations. These recipes flow through three main sections:

1. **Basic Info** (`components/metadata.tsx`) - Container metadata and settings
2. **Build Recipe** (`components/neurodocker.tsx`) - Neurodocker build directives and base image configuration
3. **Validate** (`components/validate.tsx`) - Recipe validation and Dockerfile generation

### Key Components Structure

**Main Application** (`app/page.tsx`)
- Manages overall application state and navigation
- Handles local storage for saved containers
- Implements three-section workflow with sidebar navigation

**Recipe Management**
- `components/recipe.tsx` - Main build recipe component wrapper
- `components/neurodocker.tsx` - Neurodocker-specific build configuration
- `components/directives/` - Individual directive components (install, environment, etc.)
- `components/add.tsx` - Directive addition interface

**Builder System** (`lib/builder.ts`)
- Pyodide-based Python integration for Neurodocker
- Downloads and caches build tools from NeuroContainers repository
- Generates Dockerfiles from recipe descriptions

**GitHub Integration**
- `lib/github.ts` - GitHub API service with caching
- `components/githubRecipes.tsx` - Browse existing recipes from NeuroContainers repo
- `components/githubExport.tsx` - Export/publish recipes to GitHub

### State Management
- Main recipe state managed in `app/page.tsx` with local storage persistence
- Each directive component manages its own internal state
- GitHub data cached via service layer with configurable TTL

### File Structure Patterns
- `/components/directives/` - One file per directive type (install.tsx, environment.tsx, etc.)
- `/lib/` - Business logic and external integrations
- `/types/` - TypeScript type definitions
- Component naming: PascalCase for components, camelCase for hooks/utilities

### Build Configuration
- Static export enabled (`next.config.ts`) with optional base path
- TypeScript with strict mode and path aliases (`@/*` maps to root)
- Tailwind CSS for styling with custom theme
- ESLint with Next.js and TypeScript rules

## Development Notes

- Uses Pyodide for client-side Python execution (Neurodocker integration)
- Local storage used for recipe persistence (browser-only, not synced)
- GitHub integration requires no authentication for public repositories
- Recipe validation happens client-side via Python builder
- Drag-and-drop reordering supported for directives