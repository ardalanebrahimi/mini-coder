# Toolbox Project Item Component

This component represents a single project item in the toolbox sidebar. It was extracted from the main app component to improve code organization and reusability.

## Component Hierarchy

```
AppComponent
└── ToolboxComponent
    └── ToolboxProjectItemComponent (multiple instances)
```

## Features

- Displays project information (name, command, language, date)
- Shows selection state
- Handles click events for loading projects
- Handles delete button clicks
- Responsive design with hover effects

## Inputs

- `project: SavedProject` - The project data to display
- `isSelected: boolean` - Whether this project is currently selected

## Outputs

- `projectClick: EventEmitter<SavedProject>` - Emitted when the project is clicked to load it
- `deleteClick: EventEmitter<SavedProject>` - Emitted when the delete button is clicked

## Usage

```html
<app-toolbox-project-item
  [project]="project"
  [isSelected]="selectedProject?.id === project.id"
  (projectClick)="loadProject($event)"
  (deleteClick)="deleteProject($event)"
></app-toolbox-project-item>
```

## Styling

The component includes its own SCSS file with styles that were previously part of the main app component. This ensures the component is self-contained and maintainable.
