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
      appSubtitle: "Build fun mini apps just by talking or typing!",
      tellMeWhat: "Tell me what to build! 🎯",
      tryExample: "Try Example",
      createApp: "Create App",
      creating: "Creating...",
      livePreview: "Live Preview",
      readOnly: "Read Only",
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
      // Auth related translations
      loginRequired: "Login Required",
      registerRequired: "Register Required",
      authRequiredMessage: "Please log in or register to use this feature.",
      email: "Email",
      password: "Password",
      name: "Name",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      namePlaceholder: "Enter your name",
      login: "Login",
      register: "Register",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      fillAllFields: "Please fill in all fields",
      loginFailed: "Login failed. Please check your credentials.",
      registrationFailed: "Registration failed. Please try again.",
      notLoggedInMessage:
        "Not logged in: Please log in or register to use this feature",
      rebuildFromScratch: "Rebuild from Scratch",
      // Profile related translations
      profile: "Profile",
      welcome: "Welcome",
      logout: "Logout",
      "profile.title": "Profile",
      "profile.subtitle": "Manage your account settings and preferences",
      "profile.userInfo": "User Information",
      "profile.username": "Username",
      "profile.email": "Email",
      "profile.displayName": "Display Name",
      "profile.displayNamePlaceholder": "Optional display name",
      "profile.accountDetails": "Account Details",
      "profile.tokens": "Tokens",
      "profile.memberSince": "Member Since",
      "profile.lastUpdated": "Last Updated",
      "profile.languageSettings": "Language Settings",
      "profile.language": "Interface Language",
      "profile.security": "Security",
      "profile.changePassword": "Change Password",
      "profile.currentPassword": "Current Password",
      "profile.currentPasswordPlaceholder": "Enter your current password",
      "profile.newPassword": "New Password",
      "profile.newPasswordPlaceholder":
        "Enter your new password (min 6 characters)",
      "profile.confirmPassword": "Confirm New Password",
      "profile.confirmPasswordPlaceholder": "Confirm your new password",
      "profile.updatePassword": "Update Password",
      "common.loading": "Loading...",
      "common.edit": "Edit",
      "common.save": "Save Changes",
      "common.cancel": "Cancel",
    },
    de: {
      appTitle: "Mini Coder",
      appSubtitle: "Baue coole Mini-Apps - einfach sprechen oder tippen!",
      tellMeWhat: "Sag mir, was ich bauen soll! 🎯",
      tryExample: "Beispiel testen",
      createApp: "App erstellen",
      creating: "Erstelle...",
      livePreview: "Live-Vorschau",
      readOnly: "Nur Lesen",
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
      // Auth related translations
      loginRequired: "Anmeldung erforderlich",
      registerRequired: "Registrierung erforderlich",
      authRequiredMessage:
        "Bitte melden Sie sich an oder registrieren Sie sich, um diese Funktion zu nutzen.",
      email: "E-Mail",
      password: "Passwort",
      name: "Name",
      emailPlaceholder: "E-Mail eingeben",
      passwordPlaceholder: "Passwort eingeben",
      namePlaceholder: "Name eingeben",
      login: "Anmelden",
      register: "Registrieren",
      noAccount: "Noch kein Konto?",
      haveAccount: "Bereits ein Konto?",
      fillAllFields: "Bitte füllen Sie alle Felder aus",
      loginFailed:
        "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.",
      registrationFailed:
        "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
      notLoggedInMessage:
        "Nicht angemeldet: Bitte melden Sie sich an oder registrieren Sie sich, um diese Funktion zu nutzen",
      rebuildFromScratch: "Neu von Grund auf erstellen",
      // Profile related translations
      profile: "Profil",
      welcome: "Willkommen",
      logout: "Abmelden",
      "profile.title": "Profil",
      "profile.subtitle":
        "Verwalten Sie Ihre Kontoeinstellungen und Präferenzen",
      "profile.userInfo": "Benutzerinformationen",
      "profile.username": "Benutzername",
      "profile.email": "E-Mail",
      "profile.displayName": "Anzeigename",
      "profile.displayNamePlaceholder": "Optionaler Anzeigename",
      "profile.accountDetails": "Kontodetails",
      "profile.tokens": "Token",
      "profile.memberSince": "Mitglied seit",
      "profile.lastUpdated": "Zuletzt aktualisiert",
      "profile.languageSettings": "Spracheinstellungen",
      "profile.language": "Benutzeroberflächen-Sprache",
      "profile.security": "Sicherheit",
      "profile.changePassword": "Passwort ändern",
      "profile.currentPassword": "Aktuelles Passwort",
      "profile.currentPasswordPlaceholder":
        "Geben Sie Ihr aktuelles Passwort ein",
      "profile.newPassword": "Neues Passwort",
      "profile.newPasswordPlaceholder":
        "Geben Sie Ihr neues Passwort ein (mind. 6 Zeichen)",
      "profile.confirmPassword": "Neues Passwort bestätigen",
      "profile.confirmPasswordPlaceholder": "Bestätigen Sie Ihr neues Passwort",
      "profile.updatePassword": "Passwort aktualisieren",
      "common.loading": "Lädt...",
      "common.edit": "Bearbeiten",
      "common.save": "Änderungen speichern",
      "common.cancel": "Abbrechen",
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
