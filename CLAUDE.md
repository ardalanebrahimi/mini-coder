# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini Coder is an Angular 16 web application that generates kid-friendly, interactive HTML mini-apps using OpenAI's GPT API. It's a standalone component-based application with Capacitor integration for mobile deployment (Android/iOS).

## Development Commands

### Core Development
- `npm start` - Start development server (ng serve)
- `npm run build` - Build for production
- `npm run watch` - Build with watch mode
- `npm test` - Run tests with Karma
- `npm run lint` - Run Angular linter

### Capacitor Mobile Development
- `npm run cap:add` - Add a platform (android/ios)
- `npm run cap:copy` - Copy web assets to native projects
- `npm run cap:sync` - Sync web assets and update plugins
- `npm run cap:open` - Open native IDE (Android Studio/Xcode)
- `npm run cap:run` - Run on device/emulator
- `npm run cap:build` - Build Angular app and copy to native projects

## Architecture

### Application Structure
The app uses Angular's standalone components architecture (no NgModule). Bootstrap happens in `src/main.ts`, which sets up routes and the root `RootComponent`.

**Key Routing:**
- `/landing` - Marketing landing page (public)
- `/login` & `/register` - Authentication pages (public)
- `/home` - Main app interface (protected by `AuthGuard`)
- `/shared/:shareId` - Shared app preview (public)

**Main Components:**
- `AppComponent` - Core application logic (1300+ lines), handles command processing, app generation, toolbox, modals
- `RootComponent` - Simple router outlet wrapper with header
- `InputSectionComponent` - Command input with voice support
- `PreviewSectionComponent` - Displays generated apps in iframe
- `ToolboxComponent` - Manages saved projects sidebar
- `AppStoreComponent` - Browse and try community-published apps

### Service Architecture

**Core Services:**
- `PromptProcessorService` - Processes commands via OpenAI API, handles language detection (franc-min), generates HTML apps
  - `processCommand()` - Create new app from scratch
  - `processModifyCommand()` - Modify existing app with context awareness
- `StorageService` - Backend API integration for saving/loading projects
- `AuthService` - JWT-based authentication with Google OAuth support
- `AnalyticsService` - Tracks user events and app interactions

**Feature Services:**
- `CodeMinifierService` - Minifies HTML/CSS/JS to reduce token usage when modifying apps
- `AppNameGeneratorService` - Uses OpenAI to generate creative app names
- `WhisperVoiceService` - Voice input via OpenAI Whisper API
- `TranslationService` - Multi-language support (English, German)
- `TestPreviewService` - Debug/test preview generation

**Dialog Services** (manage modal state):
- `SaveDialogService` - Save to toolbox or App Store
- `BuildChoiceDialogService` - Choose modify vs rebuild
- `ModifyAppDialogService` - Modify/rebuild dialog
- `AppPopupService` - Full-screen app preview popup
- `ProfileService` - User profile modal

### Key Architectural Patterns

**Service Communication:**
Most services expose RxJS Observables/Subjects for reactive state management. Components subscribe using `takeUntil(this.destroy$)` pattern for proper cleanup.

**API Integration:**
- Backend API URL configured in `src/environments/environment.ts`
- `AuthInterceptor` adds JWT tokens to requests
- All API calls go through services, never directly from components

**App Generation Flow:**
1. User enters command → `InputSectionComponent`
2. Language detected via franc-min
3. OpenAI API called with system prompt + user command
4. Generated HTML sanitized and displayed in iframe (blob URL)
5. App can be saved to toolbox (private) or App Store (public)

**Modify vs Rebuild:**
- **Modify:** Sends current app code + modification request to OpenAI (preserves app structure)
- **Rebuild:** Treats command as new app creation (starts from scratch)

### Important Technical Details

**OpenAI Integration:**
- API key stored in `environment.ts` (should be in backend for production)
- System prompt creates kid-friendly, safe, self-contained HTML apps
- Token limit: 3000 tokens per request
- Code minification used for modify operations to reduce token usage

**Security:**
- `AuthGuard` protects `/home` route
- JWT tokens stored in localStorage
- `DomSanitizer.bypassSecurityTrustHtml()` used for generated code (apps are sandboxed in iframes)
- Apps use blob URLs for iframe rendering

**Mobile Support (Capacitor):**
- Config: `capacitor.config.json`
- Web output: `dist/mini-coder`
- Supports Android/iOS deployment
- Plugin configuration for splash screen, status bar, keyboard

**Multi-language Support:**
- UI translates between English/German
- App generation respects user's language for generated content
- Language detection via franc-min library

## Coding Practices (from .github/copilot-instructions.md)

- **File Size:** Max 300 lines per file. Split logic, UI, and types into separate files.
- **Modularity:** Favor composition and reusability. Separate concerns cleanly.
- **TypeScript:** Use strict typing throughout.
- **Agent Behavior:**
  - Never run/test/debug code automatically
  - Ask before making related changes after completing a task
  - Request clarification for ambiguous requirements
  - Don't make assumptions or invent missing requirements

## Environment Configuration

The app uses environment files:
- `environment.ts` - Development config
- `environment.prod.ts` - Production config
- Templates: `environment.template.ts`, `environment.prod.template.ts`

**Critical Environment Variables:**
- `apiUrl` - Backend API endpoint
- `openaiApiKey` - OpenAI API key (security risk if in frontend)
- `googleClientId` - Google OAuth client ID
- `systemPrompt` & `openAIFixInstructions` - AI generation instructions

## Testing Notes

- Karma + Jasmine test framework configured
- Test files use `.spec.ts` extension
- Chrome launcher configured for test execution
