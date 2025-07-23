import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private selectedLanguageSubject = new BehaviorSubject<string>("en");
  public selectedLanguage$ = this.selectedLanguageSubject.asObservable();

  private readonly translations: Translations = {
    en: {
      appTitle: "Mini Coder",
      appSubtitle: "Create awesome mini apps with just words!",
      tellMeWhat: "Tell me what to build! 🎯",
      tryExample: "Try Example",
      createApp: "Create App",
      creating: "Creating...",
      livePreview: "Live Preview",
      saveToToolbox: "Save to Toolbox",
      clear: "Clear",
      myToolbox: "My Toolbox",
      noProjects: "No saved projects yet!",
      noProjectsSubtext: "Create and save your first app to get started.",
      saveToToolboxTitle: "Save to Toolbox",
      projectName: "Project Name:",
      command: "Command:",
      language: "Language:",
      cancel: "Cancel",
      save: "Save",
      placeholderText:
        'Be specific! Examples: "Create a working calculator with all basic operations" or "Make an interactive quiz about animals"',
      modifyApp: "Modify This App",
      modifyPlaceholder:
        'What would you like to change? e.g., "Change background to blue" or "Add 5 more colors"',
      rebuildApp: "Rebuild from Scratch",
      voiceInput: "Voice Input",
      listening: "Listening...",
      clickToSpeak: "Click to speak",
      voiceNotSupported: "Voice input not supported in this browser",
      buildChoice: "How would you like to proceed?",
      buildChoiceText:
        "You can either modify the current app or rebuild completely from scratch.",
      modifyExisting: "Modify Current App",
      rebuildFromScratch: "Rebuild from Scratch",
    },
    de: {
      appTitle: "Mini Coder",
      appSubtitle: "Erstelle großartige Mini-Apps nur mit Worten!",
      tellMeWhat: "Sag mir, was ich bauen soll! 🎯",
      tryExample: "Beispiel testen",
      createApp: "App erstellen",
      creating: "Erstelle...",
      livePreview: "Live-Vorschau",
      saveToToolbox: "In Werkzeugkasten speichern",
      clear: "Löschen",
      myToolbox: "Mein Werkzeugkasten",
      noProjects: "Noch keine gespeicherten Projekte!",
      noProjectsSubtext:
        "Erstelle und speichere deine erste App, um loszulegen.",
      saveToToolboxTitle: "In Werkzeugkasten speichern",
      projectName: "Projektname:",
      command: "Befehl:",
      language: "Sprache:",
      cancel: "Abbrechen",
      save: "Speichern",
      placeholderText:
        'Sei spezifisch! Beispiele: "Erstelle einen funktionierenden Taschenrechner mit allen Grundrechenarten" oder "Mache ein interaktives Quiz über Tiere"',
      modifyApp: "Diese App ändern",
      modifyPlaceholder:
        'Was möchtest du ändern? z.B. "Hintergrund zu blau ändern" oder "5 weitere Farben hinzufügen"',
      rebuildApp: "Neu von Grund auf erstellen",
      voiceInput: "Spracheingabe",
      listening: "Höre zu...",
      clickToSpeak: "Klicken zum Sprechen",
      voiceNotSupported:
        "Spracheingabe wird in diesem Browser nicht unterstützt",
      buildChoice: "Wie möchtest du fortfahren?",
      buildChoiceText:
        "Du kannst entweder die aktuelle App ändern oder komplett neu von Grund auf erstellen.",
      modifyExisting: "Aktuelle App ändern",
      rebuildFromScratch: "Neu von Grund auf erstellen",
    },
  };

  private readonly availableLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  constructor() {}

  getCurrentLanguage(): string {
    return this.selectedLanguageSubject.value;
  }

  setLanguage(languageCode: string): void {
    if (this.translations[languageCode]) {
      this.selectedLanguageSubject.next(languageCode);
    }
  }

  getAvailableLanguages() {
    return this.availableLanguages;
  }

  translate(key: string, languageCode?: string): string {
    const lang = languageCode || this.selectedLanguageSubject.value;
    const translations = this.translations[lang];
    return translations?.[key] || key;
  }

  // Convenient shorthand method
  t(key: string): string {
    return this.translate(key);
  }

  getTranslations(languageCode?: string) {
    const lang = languageCode || this.selectedLanguageSubject.value;
    return this.translations[lang] || this.translations["en"];
  }
}
