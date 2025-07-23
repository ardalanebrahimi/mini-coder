# Build Choice Dialog Component

A standalone Angular component that handles the choice between modifying an existing app or rebuilding from scratch.

## Features

- Service-based architecture using `BuildChoiceDialogService`
- Standalone component design
- Reactive UI with proper modal behavior
- Translation support
- Clear visual distinction between modify and rebuild options

## Usage

The component is controlled entirely through the `BuildChoiceDialogService`:

```typescript
// Open the build choice dialog
this.buildChoiceDialogService.openDialog();

// Close the dialog
this.buildChoiceDialogService.closeDialog();

// Listen for user's choice
this.buildChoiceDialogService.choice$
  .pipe(takeUntil(this.destroy$))
  .subscribe((result) => {
    if (result) {
      if (result.choice === BuildChoiceType.MODIFY_EXISTING) {
        // Handle modify existing
      } else if (result.choice === BuildChoiceType.REBUILD_FROM_SCRATCH) {
        // Handle rebuild from scratch
      }
    }
  });
```

## Architecture

- **BuildChoiceDialogService**: Manages dialog state and user choice
- **BuildChoiceDialogComponent**: Renders the UI and handles user interactions
- **TranslationService**: Provides localized text

## Choice Types

```typescript
export enum BuildChoiceType {
  MODIFY_EXISTING = "modify",
  REBUILD_FROM_SCRATCH = "rebuild",
}
```

## Behavior

When the dialog opens:

1. User sees two clear options: **Modify Existing** vs **Rebuild from Scratch**
2. Each option has descriptive text and appropriate icons
3. User clicks their preferred option
4. Dialog closes and emits the choice through the service
5. Parent component can react to the choice via subscription

## Service Methods

- `openDialog()` - Opens the build choice dialog
- `closeDialog()` - Closes the dialog
- `selectModifyExisting()` - User chose to modify existing app
- `selectRebuildFromScratch()` - User chose to rebuild from scratch
- `isDialogOpen()` - Get current dialog state

## Benefits

- **Clear UX**: Users understand the difference between modify vs rebuild
- **Service-based**: No prop drilling or input/output patterns
- **Reusable**: Can be used from anywhere in the app
- **Maintainable**: Isolated logic in its own component
- **Consistent**: Uses shared modal styles
