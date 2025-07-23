# Service-Based Architecture Refactor

This document outlines the refactoring from input/output component communication to a service-based architecture.

## Architecture Overview

### Before (Input/Output Pattern)

```
AppComponent
├── [input/output bindings]
└── ToolboxComponent
    ├── [input/output bindings]
    └── ToolboxProjectItemComponent
```

**Issues with old approach:**

- Tight coupling between components
- Prop drilling through component hierarchy
- Hard to scale and maintain
- Difficult to test in isolation
- Parent component needs to know about all child events

### After (Service-Based Pattern)

```
AppComponent
├── ToolboxService (injected)
├── TranslationService (injected)
└── ToolboxComponent
    ├── ToolboxService (injected)
    ├── TranslationService (injected)
    └── ToolboxProjectItemComponent
        └── ToolboxService (injected)
```

**Benefits of new approach:**

- Loose coupling via dependency injection
- Centralized state management
- Better scalability and maintainability
- Easier testing with service mocking
- Event-driven architecture with RxJS
- **Complete elimination of input/output chains**

## New Services

### 1. ToolboxService (`services/toolbox.service.ts`)

**Purpose:** Manages toolbox state and project interactions

**Key Features:**

- **State Management:** Uses BehaviorSubjects for reactive state
- **Event Streams:** Provides observables for component communication
- **Project Management:** CRUD operations for saved projects
- **UI State:** Controls toolbox open/close state

**Public API:**

```typescript
// State Observables
isOpen$: Observable<boolean>
selectedProject$: Observable<SavedProject | null>
savedProjects$: Observable<SavedProject[]>

// Event Streams
projectLoad$: Observable<SavedProject | null>
projectDelete$: Observable<SavedProject | null>

// Methods
open(): void
close(): void
toggle(): void
setSavedProjects(projects: SavedProject[]): void
addProject(project: SavedProject): void
removeProject(projectId: string): void
loadProject(project: SavedProject): void
deleteProject(project: SavedProject): void
```

### 2. TranslationService (`services/translation.service.ts`)

**Purpose:** Manages internationalization and language state

**Key Features:**

- **Language Management:** Centralized language switching
- **Translation Logic:** Clean translation interface
- **Reactive Updates:** Observable language changes
- **Type Safety:** Structured translation objects

**Public API:**

```typescript
// State Observable
selectedLanguage$: Observable<string>

// Methods
getCurrentLanguage(): string
setLanguage(languageCode: string): void
getAvailableLanguages(): Language[]
translate(key: string, languageCode?: string): string
t(key: string): string // Convenient shorthand
```

## Component Updates

### AppComponent Changes

**Removed:**

- Large translation object (moved to TranslationService)
- savedProjects property (managed by ToolboxService)
- selectedProject property (managed by ToolboxService)
- showToolbox property (managed by ToolboxService)
- Direct input/output bindings

**Added:**

- Service dependency injection
- Service subscription setup in ngOnInit
- Reactive event handling via observables
- Getter properties for template binding

**Key Methods:**

```typescript
// Service-based methods
private setupServiceSubscriptions(): void
private loadProjectFromService(project: SavedProject): void
private deleteProjectFromService(project: SavedProject): void

// Getter properties for template
get showToolbox(): boolean
get savedProjectsCount(): number
get selectedLanguage(): string // Read-only - managed by TranslationService
get availableLanguages(): Language[]
```

**Template Binding Updates:**

```html
<!-- Two-way binding changed to one-way + event for read-only properties -->
<!-- Before: -->
[(ngModel)]="selectedLanguage"

<!-- After: -->
[ngModel]="selectedLanguage" (ngModelChange)="changeLanguage($event)"
```

### ToolboxComponent Changes

**Removed:**

- All @Input() and @Output() decorators
- Manual translation logic
- Event emitter setup
- Event handling methods for project items (onProjectLoad, onProjectDelete)

**Added:**

- Service dependency injection
- Reactive state subscriptions
- Automatic UI updates via observables

**Simplified Template Binding:**

```html
<!-- Before: Complex input/output binding -->
<app-toolbox
  [isOpen]="showToolbox"
  [savedProjects]="savedProjects"
  [selectedProject]="selectedProject"
  [translations]="translations"
  [selectedLanguage]="selectedLanguage"
  (closeToolbox)="toggleToolbox()"
  (loadProject)="loadProject($event)"
  (deleteProject)="deleteProject($event)"
></app-toolbox>

<!-- After: Clean, no bindings needed -->
<app-toolbox></app-toolbox>
```

### ToolboxProjectItemComponent Changes

**Removed:**

- All @Output() decorators (projectClick, deleteClick)
- isSelected @Input() property (now managed internally)
- Manual event emission

**Added:**

- Service dependency injection (ToolboxService)
- Reactive selection state management
- Direct service method calls for actions
- Proper subscription lifecycle management

**Simplified Component Interface:**

```typescript
// Before: Complex input/output interface
@Input() project!: SavedProject;
@Input() isSelected: boolean = false;
@Output() projectClick = new EventEmitter<SavedProject>();
@Output() deleteClick = new EventEmitter<SavedProject>();

// After: Clean, minimal interface
@Input() project!: SavedProject;
// That's it! Everything else handled by service
```

**Template Usage Simplified:**

```html
<!-- Before: Multiple bindings required -->
<app-toolbox-project-item
  [project]="project"
  [isSelected]="selectedProject?.id === project.id"
  (projectClick)="onProjectLoad($event)"
  (deleteClick)="onProjectDelete($event)"
></app-toolbox-project-item>

<!-- After: Just the essential data -->
<app-toolbox-project-item [project]="project"></app-toolbox-project-item>
```

## Data Flow

### Project Loading

1. User clicks project in ToolboxComponent
2. ToolboxComponent calls `toolboxService.loadProject(project)`
3. ToolboxService emits via `projectLoad$` stream
4. AppComponent subscribes and handles in `loadProjectFromService()`
5. AppComponent updates preview and UI state

### Project Deletion

1. User clicks delete in ToolboxProjectItemComponent
2. Event bubbles to ToolboxComponent
3. ToolboxComponent calls `toolboxService.deleteProject(project)`
4. ToolboxService emits via `projectDelete$` stream
5. AppComponent subscribes and shows confirmation dialog
6. On confirmation, removes from storage and updates service state

### Language Changes

1. User selects language in AppComponent
2. AppComponent calls `translationService.setLanguage(code)`
3. TranslationService emits via `selectedLanguage$` stream
4. All components automatically update translations
5. Speech recognition language updates reactively

## Benefits Achieved

### 1. **Loose Coupling**

- Components don't need to know about each other
- Communication happens through services
- Easy to modify one component without affecting others

### 2. **Better State Management**

- Centralized state in services
- Reactive updates with RxJS
- Single source of truth for application state

### 3. **Improved Scalability**

- Easy to add new components that need toolbox access
- Service can be extended without changing existing components
- Clear separation of concerns

### 4. **Enhanced Testability**

- Services can be easily mocked in tests
- Components can be tested in isolation
- Clear dependencies make testing straightforward

### 5. **Cleaner Code**

- No prop drilling
- Simpler component templates
- More focused component responsibilities

## Migration Guide

If you want to extend this pattern to other parts of the application:

1. **Identify State:** What data needs to be shared?
2. **Create Service:** Centralize state and logic
3. **Use Observables:** Make state reactive
4. **Inject Service:** Add to component constructors
5. **Subscribe to Changes:** Update UI reactively
6. **Remove Bindings:** Clean up input/output decorators

This service-based architecture provides a much more maintainable and scalable foundation for the application!
