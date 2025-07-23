# Test Preview Service

This service handles test preview functionality that was previously embedded in the app component. It provides methods for generating test HTML content and managing blob/data URLs for testing purposes.

## Features

- **generateTestPreview()**: Creates a test calculator app with full HTML, CSS, and JavaScript
- **generateBlobTestPreview()**: Creates a simple blob URL test page
- **createBlobUrl()**: Manages blob URL creation with automatic cleanup
- **getDataUrl()**: Creates data URLs for iframe content

## Usage

```typescript
// Inject the service
constructor(private testPreviewService: TestPreviewService) {}

// Generate test preview
const testResult = this.testPreviewService.generateTestPreview();

// Create blob URL
const blobUrl = this.testPreviewService.createBlobUrl(htmlContent, previousUrl);
```

## Purpose

This service separates test/debug functionality from the main app component, making the codebase more modular and maintainable. The test previews are used for debugging iframe functionality and verifying that generated HTML apps work correctly.
