# Input Section Component

This component handles the user input section of the Mini Coder application using a service-based architecture for better separation of concerns.

## Architecture

### **Services Used:**
- **`CommandInputService`** - Manages input state (command text, processing status, voice status)
- **`CommandActionsService`** - Handles user actions and business logic
- **`TranslationService`** - Provides internationalization support

### **Benefits of Service-Based Approach:**
- ✅ **Loose coupling** - Component doesn't directly depend on parent
- ✅ **Better testability** - Services can be easily mocked
- ✅ **Reusability** - Component can be used anywhere without complex bindings
- ✅ **Centralized state management** - State is managed in services
- ✅ **Reactive programming** - Uses RxJS observables for state updates

## Features

- Text input for user commands with real-time state synchronization
- Voice input support (when available) with listening indicators
- Example command button with automatic command generation
- Process command button with loading states
- Test buttons for debugging (hidden by default)
- Full internationalization support

## State Management

The component subscribes to state changes from `CommandInputService`:

```typescript
interface CommandInputState {
  userCommand: string;
  isProcessing: boolean;
  voiceSupported: boolean;
  isListening: boolean;
}
```

## Actions

User actions are handled through `CommandActionsService`:

```typescript
interface CommandAction {
  type: 'PROCESS_COMMAND' | 'SET_EXAMPLE' | 'START_VOICE' | 'TEST_STATIC' | 'TEST_BLOB';
  payload?: any;
}
```

## Usage

Simply include the component in your template - no inputs or outputs needed:

```html
<app-input-section></app-input-section>
```

The component automatically handles all state management and actions through services, making it completely self-contained and easy to integrate anywhere in the application.
