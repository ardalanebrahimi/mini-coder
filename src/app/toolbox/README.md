# Toolbox Component

This component represents the entire toolbox sidebar that was extracted from the main app component. It provides a clean, self-contained way to manage saved projects.

## Features

- **Sidebar Layout**: Fixed positioned sidebar that slides in from the right
- **Project Management**: Displays saved projects using the ToolboxProjectItemComponent
- **Empty State**: Shows helpful message when no projects are saved
- **Responsive Design**: Adapts to mobile screens
- **Internationalization**: Supports multiple languages via translation props
- **Event Handling**: Emits events for parent component to handle business logic

## Inputs

- `isOpen: boolean` - Controls whether the sidebar is visible
- `savedProjects: SavedProject[]` - Array of saved projects to display
- `selectedProject: SavedProject | null` - Currently selected project (for highlighting)
- `translations: any` - Translation object containing all language strings
- `selectedLanguage: string` - Current language code (e.g., 'en', 'de')

## Outputs

- `closeToolbox: EventEmitter<void>` - Emitted when the close button is clicked
- `loadProject: EventEmitter<SavedProject>` - Emitted when a project is selected to load
- `deleteProject: EventEmitter<SavedProject>` - Emitted when a project is deleted

## Usage

```html
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
```

## Architecture

- **Self-contained**: Component has its own styles and translation logic
- **Event-driven**: Uses output events to communicate with parent
- **Reusable**: Can be used in other parts of the application
- **Responsive**: Mobile-friendly design with full-width on small screens

## Styling

The component includes comprehensive SCSS styling that was extracted from the main app component:
- Slide-in animation from the right
- Fixed positioning and z-index management
- Responsive breakpoints for mobile devices
- Empty state styling
- Header and content area layout

## Dependencies

- `ToolboxProjectItemComponent` - Used to render individual project items
- `CommonModule` - For Angular structural directives
- `SavedProject` interface - Type definition for project data
