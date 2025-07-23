# Shared Modal Styles

This directory contains shared SCSS styles that are used across multiple components in the application.

## Files

### `modal-styles.scss`
Contains common modal dialog styles that are shared between:
- `SaveDialogComponent`
- `AppComponent` (for Build Choice and Modify App dialogs)

## Usage

To use the shared modal styles in a component:

```scss
// Import shared modal styles
@import '../shared/modal-styles.scss';

// Add component-specific styles below
.my-component-specific-style {
  // ...
}
```

## Available Classes

### Layout Classes
- `.modal-overlay` - Full-screen overlay with backdrop
- `.modal-content` - Modal container with styling
- `.modal-body` - Main content area of the modal
- `.modal-actions` - Button container area

### Content Classes
- `.modal-info` - Information display section with light background

### Button Classes
- `.btn-primary` - Primary action button (blue)
- `.btn-secondary` - Secondary action button (gray)

### Utility Classes
- `.emoji` - Normalizes emoji display

## Design System

The shared styles follow these design principles:
- **Consistent spacing**: 1rem gaps, 2rem padding
- **Consistent colors**: Blue primary (#667eea), gray secondary (#e0e0e0)
- **Responsive design**: Stacks buttons vertically on mobile
- **Smooth interactions**: Hover effects with transform and transitions
- **Accessibility**: Proper focus states and disabled states

## Benefits

1. **Consistency**: All modals look and behave the same way
2. **Maintainability**: Changes to modal styles only need to be made in one place
3. **Bundle size**: Reduces CSS duplication
4. **Developer experience**: Clear, reusable class names
5. **Theme consistency**: Centralized color and spacing decisions

## Component-Specific Styles

Each component should only include styles that are unique to that component:

- **SaveDialogComponent**: `.project-name-input`, `.error-message`
- **AppComponent**: `.modify-command-input`, build choice specific styles

## Future Improvements

Consider moving this to a more global location if other feature areas need modal dialogs:
- `src/styles/components/modal.scss`
- Or integrate with a design system like Angular Material
