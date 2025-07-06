# Mini Coder 🚀✨

A fun and interactive Angular + Capacitor app that lets kids create simple mini apps using natural language commands in English or German!

## Features

- **Natural Language Processing**: Kids can describe what they want in plain English or German
- **AI-Powered Generation**: Uses OpenAI API to convert commands into working HTML/CSS/JS apps
- **Live Preview**: See the generated app instantly in a sandboxed iframe
- **Personal Toolbox**: Save and organize created apps locally
- **Multi-language Support**: Automatic language detection (English/German)
- **Kid-Friendly UI**: Colorful, intuitive interface designed for children
- **Cross-Platform**: Works on web, iOS, and Android via Capacitor

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up OpenAI API Key**:

   - Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`
   - Replace `'sk-dummy-key-replace-with-real-key'` with your actual OpenAI API key

3. **Run the development server**:

   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:4200`

## Example Commands

### English Examples:

- "Make a quiz about animals"
- "Create a simple calculator"
- "Build a color guessing game"
- "Create a drawing app"
- "Make a memory game"

### German Examples:

- "Erstelle eine Zähler-App"
- "Mache ein Memory-Spiel"
- "Baue einen Rechner"
- "Erstelle ein Tier-Quiz"

## Project Structure

```
src/
├── app/
│   ├── services/
│   │   ├── prompt-processor.service.ts  # OpenAI API integration
│   │   └── storage.service.ts           # Local storage management
│   ├── app.component.ts                 # Main application component
│   ├── app.component.html               # Main template
│   └── app.component.scss               # Styles
├── environments/
│   ├── environment.ts                   # Development config
│   └── environment.prod.ts              # Production config
├── assets/
│   ├── manifest.json                    # PWA manifest
│   └── icons/                           # App icons
├── index.html                           # Main HTML file
├── main.ts                              # Application bootstrap
└── styles.scss                          # Global styles
```

## Building for Production

1. **Build the app**:

   ```bash
   npm run build
   ```

2. **Add mobile platforms** (optional):

   ```bash
   npx cap add ios
   npx cap add android
   ```

3. **Sync with Capacitor**:

   ```bash
   npm run cap:sync
   ```

4. **Open in native IDE**:
   ```bash
   npx cap open ios
   npx cap open android
   ```

## Configuration

### OpenAI API Setup

1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Update the environment files with your key
3. Ensure you have sufficient API credits

### Capacitor Configuration

The app is configured to work with Capacitor for mobile deployment. Key settings are in `capacitor.config.json`:

- **App ID**: `com.minicoder.app`
- **App Name**: Mini Coder
- **Web Directory**: `dist/mini-coder`

## Features in Detail

### 1. Prompt Processing Service

- Detects input language using `franc-min`
- Sends structured prompts to OpenAI API
- Sanitizes and validates generated code
- Handles errors gracefully

### 2. Storage Service

- Saves projects to localStorage
- Manages project CRUD operations
- Generates unique project names
- Handles data persistence

### 3. Live Preview

- Renders generated HTML in sandboxed iframe
- Prevents XSS attacks
- Responsive design for mobile
- Real-time updates

### 4. Toolbox System

- Save/load projects
- Project organization
- Delete functionality
- Export capabilities

## Security Considerations

- All generated HTML is sanitized using Angular's DomSanitizer
- Iframe sandbox prevents malicious code execution
- API keys should be stored securely in production
- Input validation prevents injection attacks

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers via Capacitor

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT API
- Angular team for the framework
- Capacitor for cross-platform capabilities
- franc-min for language detection

---

**Made with ❤️ for kids who love to code!**
