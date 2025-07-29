# Save Dialog Component

A standalone Angular component that handles saving projects to the toolbox.

## Features

- Service-based architecture using `SaveDialogService`
- Standalone component design
- Reactive UI with proper error handling
- Translation support
- Auto-generated unique project names
- **Pre-populated project name** from the generated app
- Real-time validation of project name input

## Usage

The component is controlled entirely through the `SaveDialogService`:

```typescript
// Open the save dialog
this.saveDialogService.openDialog({
  currentApp: this.currentApp, // Must contain projectName
  userCommand: this.userCommand,
});

// Close the dialog
this.saveDialogService.closeDialog();
```

## Behavior

When the dialog opens:

1. **Project name field** is automatically populated with `currentApp.projectName`
2. User can modify the suggested name or use it as-is
3. Validation ensures the name is not empty
4. Unique names are generated if conflicts exist

## Architecture

- **SaveDialogService**: Manages dialog state and data
- **SaveDialogComponent**: Renders the UI and handles user interactions
- **StorageService**: Handles project persistence
- **ToolboxService**: Updates the toolbox with saved projects
- **TranslationService**: Provides localized text

## Events

The component emits a custom `saveSuccess` event when a project is saved successfully:

```typescript
document.addEventListener("saveSuccess", (event: any) => {});
```
