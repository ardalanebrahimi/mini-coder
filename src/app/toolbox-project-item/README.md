# Toolbox Project Item Component

This component represents a single project item in the toolbox sidebar. It has been refactored to use a service-based architecture for better maintainability and scalability.

## Component Hierarchy

```
AppComponent
└── ToolboxComponent
    └── ToolboxProjectItemComponent (multiple instances)
            ↓ (uses services)
    ┌─── ToolboxService
    └─── TranslationService (if needed)
```

## Architecture Pattern

**Service-Based Communication** - No more input/output bindings! The component now:

- Directly injects `ToolboxService`
- Manages its own selection state by subscribing to service observables
- Communicates actions directly through service methods

## Features

- Displays project information (name, command, language, date)
- Automatically manages selection state via service subscription
- Handles click events through service calls
- Handles delete button clicks through service calls
- Responsive design with hover effects

## Inputs

- `project: SavedProject` - The only input needed (project data to display)

## Outputs

**None!** - All communication happens through the `ToolboxService`

## Service Integration

### Selection State Management

```typescript
ngOnInit(): void {
  // Automatically updates when selection changes in service
  this.toolboxService.selectedProject$
    .pipe(takeUntil(this.destroy$))
    .subscribe(selectedProject => {
      this.isSelected = selectedProject?.id === this.project.id;
    });
}
```

### Action Handling

```typescript
onProjectClick(): void {
  this.toolboxService.loadProject(this.project); // Direct service call
}

onDeleteClick(event: Event): void {
  event.stopPropagation();
  this.toolboxService.deleteProject(this.project); // Direct service call
}
```

## Usage

**Before (Input/Output Pattern):**

```html
<app-toolbox-project-item
  [project]="project"
  [isSelected]="selectedProject?.id === project.id"
  (projectClick)="loadProject($event)"
  (deleteClick)="deleteProject($event)"
></app-toolbox-project-item>
```

**After (Service-Based Pattern):**

```html
<app-toolbox-project-item [project]="project"></app-toolbox-project-item>
```

## Benefits of Service-Based Approach

1. **Simplified Usage**: Only one input needed
2. **Automatic State Sync**: Selection state updates automatically
3. **Loose Coupling**: No direct dependency on parent component
4. **Better Testability**: Easy to mock services for testing
5. **Scalable**: Easy to add new features without changing interfaces

## Dependencies

- `ToolboxService` - For state management and action handling
- `CommonModule` - For Angular structural directives
- `SavedProject` interface - Type definition for project data
- `RxJS` - For reactive subscriptions and lifecycle management

## Lifecycle Management

The component properly manages subscriptions to prevent memory leaks:

- Subscribes to service observables in `ngOnInit`
- Uses `takeUntil(this.destroy$)` pattern
- Cleans up subscriptions in `ngOnDestroy`

This service-based architecture makes the component much more maintainable and follows Angular best practices!
