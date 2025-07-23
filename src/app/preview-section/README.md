# Preview Section Component

This component manages the display and interaction with the generated application preview.

## Overview

The PreviewSectionComponent is a standalone Angular component that:

- Displays the generated application in an iframe
- Provides action buttons for modifying, saving, and clearing the app
- Handles iframe load and error events
- Communicates with the parent through PreviewSectionService

## Architecture

### Service Integration

- **PreviewSectionService**: Manages preview data and user actions
- **TranslationService**: Provides i18n support for UI text

### Data Flow

1. AppComponent updates preview data in PreviewSectionService
2. PreviewSectionComponent subscribes to data changes and updates UI
3. User interactions emit actions through PreviewSectionService
4. AppComponent listens to actions and performs appropriate operations

### Key Features

- **Reactive UI**: Updates automatically when preview data changes
- **Action Buttons**: Modify, Save, Clear functionality
- **Iframe Handling**: Robust error handling and debugging logs
- **Responsive Design**: Adapts to different screen sizes

## Usage

```html
<app-preview-section></app-preview-section>
```

## Dependencies

- PreviewSectionService (for state management)
- TranslationService (for internationalization)
- Shared modal styles (for consistent UI)

## Styling

Uses shared SCSS variables and mixins from `../shared/modal-styles.scss` for consistency with other components.
