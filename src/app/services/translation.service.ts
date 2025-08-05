import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AnalyticsService } from "./analytics.service";

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
      addToAppStore: "Add to App Store",
      shareApp: "Share App",
      "sharing.title": "Share Your App",
      "sharing.generating": "Generating your shareable app...",
      "sharing.appReady": "Your app is ready to share!",
      "sharing.saveFirst":
        "Please save your app first before sharing. Apps must be saved to generate shareable links.",
      "sharing.preview": "Preview",
      "sharing.shareLink": "Share Link",
      "sharing.copy": "Copy",
      "sharing.copied": "Copied!",
      "sharing.customText": "Share Message",
      "sharing.textPlaceholder": "Customize your share message...",
      "sharing.deviceShare": "Share via Device",
      "sharing.shareButton": "Share App",
      makeItBetter: "Make it better",
      toolboxTitle: "Save to Toolbox",
      appStoreTitle: "Publish to App Store",
      clear: "Clear",
      optional: "optional",
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
      modifyApp: "Make it better",
      modifyingApp: "Modifying your app...",
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
      username: "Username",
      name: "Name",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      usernamePlaceholder: "Enter your username",
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
      // Voice input translations
      voiceTips: "Voice Tips",
      speakClearly: "Speak clearly and loudly",
      findQuietPlace: "Find a quiet place",
      speakNaturally: "Speak naturally, don't rush",
      weHeard: "We heard",
      processing: "Processing...",
      transcriptionReady: "Transcription ready!",
      readyToListen: "Ready to listen to you!",
      speakNow: "Speak now! 🎤",
      useThis: "Use This",
      startRecording: "Start Recording",
      stopRecording: "Stop Recording",
      tryAgain: "Try Again",
      editTranscription: "You can edit this text if needed...",
      recordingFailed: "Recording failed. Please try again!",
      recordingTooShort: "Recording too short. Please speak longer!",
      // App Store translations
      appStore: "App Store",
      appStoreSubtitle: "Discover amazing apps created by the community",
      refresh: "Refresh",
      loadingAmazingApps: "Loading amazing apps...",
      tryIt: "Try It",
      star: "Star",
      starred: "Starred",
      removeStar: "Remove star",
      starThisApp: "Star this app",
      noAppsPublished: "No apps published yet",
      beTheFirst: "Be the first to publish an app to the store!",
      loadMore: "Load More",
      loading: "Loading...",
      showingApps: "Showing {{count}} of {{total}} apps",
      publishedToAppStore: "Published to App Store",
      publishToAppStore: "Publish to App Store",
      // Toolbox translations
      noProjectsMessage:
        "Save your created apps, access them anytime, and build your personal collection!",
      // Footer translations
      privacyPolicy: "Privacy Policy",
      legalNotice: "Legal Notice",
      // Form labels and buttons
      view: "View",
      play: "Play",
      delete: "Delete",
      edit: "Edit",
      publish: "Publish",
      published: "Published",
      // Date and time
      createdOn: "Created on",
      updatedOn: "Updated on",
      publishedOn: "Published on",
      // Error messages
      errorOccurred: "An error occurred",
      failedToLoad: "Failed to load. Please try again.",
      failedToLoadProjects: "Failed to load projects. Please try again.",
      // Success messages
      appSaved: "App saved!",
      appPublished: "App published!",
      starAdded: "Star added!",
      starRemoved: "Star removed!",
      // Landing page translations
      "landing.hero.headline":
        "Build amazing games and tools just by talking or typing!",
      "landing.hero.subheading":
        "A playful, AI-powered platform where kids create, play, and share their own mini games and apps. No coding required – just imagination!",
      "landing.hero.tryItFree": "Try it Free!",
      "landing.hero.browseCommunity": "Browse Community Apps",
      "landing.features.title": "Why Kids Love MiniCoder",
      "landing.features.subtitle":
        "We've built the perfect platform for young creators to bring their ideas to life safely and easily",
      "landing.features.aiPowered": "AI-Powered Creation",
      "landing.features.aiPoweredDesc":
        "Build games and tools instantly with our smart AI that understands what kids want to create",
      "landing.features.safeSecure": "Safe & Secure",
      "landing.features.safeSecureDesc":
        "Privacy-first design with no personal data collection. Parents can trust us with their kids",
      "landing.features.noCode": "No Coding Required",
      "landing.features.noCodeDesc":
        "Just speak or type what you want to build. Our AI turns your ideas into working games and apps",
      "landing.features.instantShare": "Instant Sharing",
      "landing.features.instantShareDesc":
        "Share your creations with friends and family, or publish them to our community app store",
      "landing.features.unlimitedCreation": "Unlimited Creation",
      "landing.features.unlimitedCreationDesc":
        "Build as many games and tools as you want. Your imagination is the only limit",
      "landing.features.realCode": "Real Code Generation",
      "landing.features.realCodeDesc":
        "Behind the scenes, we generate real HTML, CSS, and JavaScript that kids can learn from",
      "landing.howItWorks.title": "How It Works",
      "landing.howItWorks.subtitle":
        "Creating your own games and tools is as easy as having a conversation!",
      "landing.howItWorks.step1": "Describe Your Idea",
      "landing.howItWorks.step1Desc":
        "Tell us what game or tool you want to build using simple words",
      "landing.howItWorks.step2": "Watch the Magic",
      "landing.howItWorks.step2Desc":
        "Our AI instantly creates your app exactly as you described",
      "landing.howItWorks.step3": "Play & Test",
      "landing.howItWorks.step3Desc":
        "Try out your creation and see how it works",
      "landing.howItWorks.step4": "Share with Friends",
      "landing.howItWorks.step4Desc":
        "Show off your amazing creation to family and friends",
      "landing.faq.title": "Frequently Asked Questions",
      "landing.faq.subtitle": "Everything parents want to know about MiniCoder",
      "landing.faq.q1": "Is MiniCoder safe for my child?",
      "landing.faq.a1":
        "Absolutely! We don't collect personal data, all content is moderated, and we follow strict privacy guidelines designed for children.",
      "landing.faq.q2": "What age group is this for?",
      "landing.faq.a2":
        "MiniCoder is designed for kids, but curious older kids and even adults enjoy creating with it too!",
      "landing.faq.q3": "Does my child need to know coding?",
      "landing.faq.a3":
        "Not at all! Kids just describe what they want to build in plain language, and our AI does all the technical work.",
      "landing.faq.q4": "How much does it cost?",
      "landing.faq.a4":
        "MiniCoder is free to use! We believe every child should have access to creative technology tools.",
      "landing.faq.q5": "Can my child share their creations?",
      "landing.faq.a5":
        "Yes! Kids can share their apps with family and friends, or publish them to our moderated community app store.",
      "landing.faq.q6": "What kind of apps can kids build?",
      "landing.faq.a6":
        "Almost anything! Games, calculators, drawing tools, quizzes, timers, and much more. If they can imagine it, they can probably build it.",
      "landing.faq.q7": "Is there parental supervision?",
      "landing.faq.a7":
        "Yes! Parents can review all projects, control sharing settings, and monitor their child's activity through our parent dashboard.",
      "landing.faq.q8": "Does MiniCoder work on tablets and phones?",
      "landing.faq.a8":
        "MiniCoder works best on computers but is also compatible with tablets. We're working on a mobile app coming soon!",
      "landing.faq.q9": "How long does it take to create a game?",
      "landing.faq.a9":
        "Simple games can be created in just a few minutes! More complex projects might take an hour or two, depending on the child's vision.",
      "landing.faq.q10": "Can multiple kids work together on a project?",
      "landing.faq.a10":
        "Currently, each project is created by one child, but kids can definitely inspire each other by sharing and remixing games!",
      "landing.faq.q11": "What if my child gets frustrated or stuck?",
      "landing.faq.a11":
        "Our AI assistant is designed to be patient and helpful. We also provide step-by-step tutorials and a supportive community of young creators.",
      "landing.faq.q12": "Can kids learn real programming skills?",
      "landing.faq.a12":
        "While kids start with natural language, they gradually learn programming concepts like loops, conditions, and logic through our visual tools.",
      "landing.faq.q13": "Is there a time limit for using MiniCoder?",
      "landing.faq.a13":
        "Parents can set usage limits through parental controls. We also encourage healthy breaks with built-in reminders.",
      "landing.faq.q14": "What devices and browsers are supported?",
      "landing.faq.a14":
        "MiniCoder works on Windows, Mac, and Chromebooks with modern browsers like Chrome, Firefox, Safari, and Edge.",

      // CTA Section
      "landing.cta.title": "Ready to Start Creating?",
      "landing.cta.subtitle":
        "Join thousands of young creators building amazing games and tools with MiniCoder",
      "landing.cta.startCreating": "Start Creating for Free",
      "landing.cta.browseApps": "Browse Community Apps",

      // Safety Section
      "landing.safety.title": "Built with Safety in Mind",
      "landing.safety.subtitle": "We take child safety and privacy seriously",
      "landing.safety.privacy": "Privacy First",
      "landing.safety.privacyDesc":
        "No personal data collection. Your child's privacy is our top priority.",
      "landing.safety.moderation": "Content Moderation",
      "landing.safety.moderationDesc":
        "All shared content is reviewed to ensure it's appropriate for children.",
      "landing.safety.parentControl": "Parental Controls",
      "landing.safety.parentControlDesc":
        "Parents have full visibility and control over their child's creations and sharing.",
      "landing.safety.secure": "Secure Platform",
      "landing.safety.secureDesc":
        "Enterprise-grade security protects all user data and interactions.",
      "landing.safety.trustBadge": "Trusted by Parents",
      "landing.safety.mainTitle": "Your Child's Safety is Our Priority",
      "landing.safety.mainSubtitle":
        "We've built MiniCoder with the highest safety and privacy standards. Parents can feel confident letting their kids explore and create.",
      "landing.safety.privacyFirstTitle": "Privacy-First Design",
      "landing.safety.privacyFirstDesc":
        "We never collect personal information from children. No email addresses, names, or photos required.",
      "landing.safety.secureTitle": "Secure Platform",
      "landing.safety.secureDesc2":
        "All content is moderated and games run in a safe, sandboxed environment with no external access.",
      "landing.safety.parentalTitle": "Parental Oversight",
      "landing.safety.parentalDesc":
        "Parents can review all games their children create and have full control over sharing settings.",
      "landing.safety.communityTitle": "Kid-Safe Community",
      "landing.safety.communityDesc":
        "All shared content is reviewed by our safety team. No chat features or personal messaging.",
      "landing.safety.complianceTitle": "COPPA & GDPR Compliant",
      "landing.safety.complianceText":
        "MiniCoder is fully compliant with child privacy laws including COPPA (Children's Online Privacy Protection Act) and GDPR. We're committed to creating a safe digital playground where creativity can flourish.",
      "landing.safety.badgeCoppa": "✅ COPPA Compliant",
      "landing.safety.badgeGdpr": "🔒 GDPR Compliant",
      "landing.safety.badgeModerated": "👥 Content Moderated",

      // Testimonials Section
      "landing.testimonials.title": "What Families Are Saying",
      "landing.testimonials.t1.text":
        "My daughter created her first game in just 10 minutes! She's so proud and keeps showing it to everyone.",
      "landing.testimonials.t1.author": "Sarah M.",
      "landing.testimonials.t1.role": "Parent of Emma, 9",
      "landing.testimonials.t2.text":
        "Finally, a platform where my son can be creative without me worrying about inappropriate content or privacy issues.",
      "landing.testimonials.t2.author": "Mike R.",
      "landing.testimonials.t2.role": "Father of Alex, 8",
      "landing.testimonials.t3.text":
        "The AI understands exactly what I want to make. It's like having a magic coding assistant!",
      "landing.testimonials.t3.author": "Lily K.",
      "landing.testimonials.t3.role": "Age 12",

      // Video Section
      "landing.video.title": "See MiniCoder in Action",
      "landing.video.subtitle":
        "Watch how kids create amazing games in just minutes with our AI-powered platform",
      "landing.video.playText": "Watch Demo",
      "landing.video.feature1": "Real kids, real creations",
      "landing.video.feature2": "No coding required",
      "landing.video.feature3": "Instant results",

      // App Gallery Section
      "landing.gallery.title": "Community Creations",
      "landing.gallery.subtitle":
        "Discover amazing games and tools created by young developers like you!",
      "landing.gallery.tryApp": "Try App",
      "landing.gallery.by": "By",
      "landing.gallery.exploreMore": "Login to Explore More Games",
      "landing.gallery.app1.title": "Simon Says Game",
      "landing.gallery.app1.description":
        "Simon Says game with colors and sounds",
      "landing.gallery.app2.title": "Bug Race",
      "landing.gallery.app2.description":
        "Bug racing game with start and reset button",
      "landing.gallery.app3.title": "Tic-Tac-Toe Game",
      "landing.gallery.app3.description": "Tic-tac-toe game for two players",

      // Toolbox translations
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
      addToAppStore: "Zum App Store hinzufügen",
      shareApp: "App teilen",
      "sharing.title": "Teile deine App",
      "sharing.generating": "Erstelle deine teilbare App...",
      "sharing.appReady": "Deine App ist bereit zum Teilen!",
      "sharing.saveFirst":
        "Bitte speichere deine App zuerst, bevor du sie teilst. Apps müssen gespeichert werden, um teilbare Links zu erstellen.",
      "sharing.preview": "Vorschau",
      "sharing.shareLink": "Link teilen",
      "sharing.copy": "Kopieren",
      "sharing.copied": "Kopiert!",
      "sharing.customText": "Teilen-Nachricht",
      "sharing.textPlaceholder": "Passe deine Teilen-Nachricht an...",
      "sharing.deviceShare": "Über Gerät teilen",
      "sharing.shareButton": "App teilen",
      toolboxTitle: "In Werkzeugkasten speichern",
      appStoreTitle: "Im App Store veröffentlichen",
      clear: "Löschen",
      optional: "optional",
      myToolbox: "Mein Werkzeugkasten",
      // App Store translations
      appStore: "App Store",
      appStoreSubtitle: "Entdecke tolle Apps von der Community",
      refresh: "Aktualisieren",
      loadingAmazingApps: "Lade tolle Apps...",
      tryIt: "Ausprobieren",
      star: "Favorisieren",
      starred: "Favorisiert",
      removeStar: "Favorit entfernen",
      starThisApp: "Diese App favorisieren",
      noAppsPublished: "Noch keine Apps veröffentlicht",
      beTheFirst: "Sei der erste, der eine App im Store veröffentlicht!",
      loadMore: "Mehr laden",
      loading: "Lädt...",
      showingApps: "Zeige {{count}} von {{total}} Apps",
      publishedToAppStore: "Im App Store veröffentlicht",
      publishToAppStore: "Im App Store veröffentlichen",
      // Toolbox translations
      noProjectsMessage:
        "Speichere deine erstellten Apps, greife jederzeit darauf zu und baue deine persönliche Sammlung auf!",
      // Footer translations
      privacyPolicy: "Datenschutzerklärung",
      legalNotice: "Impressum",
      // Form labels and buttons
      view: "Ansehen",
      play: "Spielen",
      delete: "Löschen",
      edit: "Bearbeiten",
      publish: "Veröffentlichen",
      published: "Veröffentlicht",
      // Date and time
      createdOn: "Erstellt am",
      updatedOn: "Aktualisiert am",
      publishedOn: "Veröffentlicht am",
      // Error messages
      errorOccurred: "Ein Fehler ist aufgetreten",
      failedToLoad: "Laden fehlgeschlagen. Bitte versuchen Sie es erneut.",
      failedToLoadProjects:
        "Projekte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      // Success messages
      appSaved: "App gespeichert!",
      appPublished: "App veröffentlicht!",
      starAdded: "Favorit hinzugefügt!",
      starRemoved: "Favorit entfernt!",
      // Landing page translations
      "landing.hero.headline":
        "Baue tolle Spiele und Tools - einfach sprechen oder tippen!",
      "landing.hero.subheading":
        "Eine spielerische, KI-gesteuerte Plattform, auf der Kinder ihre eigenen Mini-Spiele und Apps erstellen, spielen und teilen können. Kein Programmieren erforderlich – nur Fantasie!",
      "landing.hero.tryItFree": "Kostenlos ausprobieren!",
      "landing.hero.browseCommunity": "Community-Apps durchstöbern",
      "landing.features.title": "Warum Kinder MiniCoder lieben",
      "landing.features.subtitle":
        "Wir haben die perfekte Plattform für junge Kreative geschaffen, um ihre Ideen sicher und einfach zum Leben zu erwecken",
      "landing.features.aiPowered": "KI-gesteuerte Erstellung",
      "landing.features.aiPoweredDesc":
        "Erstelle Spiele und Tools sofort mit unserer intelligenten KI, die versteht, was Kinder erschaffen wollen",
      "landing.features.safeSecure": "Sicher & Geschützt",
      "landing.features.safeSecureDesc":
        "Datenschutz-erstes Design ohne persönliche Datensammlung. Eltern können uns mit ihren Kindern vertrauen",
      "landing.features.noCode": "Kein Programmieren erforderlich",
      "landing.features.noCodeDesc":
        "Sprich oder tippe einfach, was du bauen möchtest. Unsere KI verwandelt deine Ideen in funktionierende Spiele und Apps",
      "landing.features.instantShare": "Sofortiges Teilen",
      "landing.features.instantShareDesc":
        "Teile deine Kreationen mit Freunden und Familie oder veröffentliche sie in unserem Community-App-Store",
      "landing.features.unlimitedCreation": "Unbegrenzte Kreativität",
      "landing.features.unlimitedCreationDesc":
        "Baue so viele Spiele und Tools, wie du möchtest. Deine Fantasie ist die einzige Grenze",
      "landing.features.realCode": "Echte Code-Generierung",
      "landing.features.realCodeDesc":
        "Im Hintergrund generieren wir echten HTML-, CSS- und JavaScript-Code, von dem Kinder lernen können",
      "landing.howItWorks.title": "So funktioniert es",
      "landing.howItWorks.subtitle":
        "Eigene Spiele und Tools zu erstellen ist so einfach wie ein Gespräch!",
      "landing.howItWorks.step1": "Beschreibe deine Idee",
      "landing.howItWorks.step1Desc":
        "Erzähle uns mit einfachen Worten, welches Spiel oder Tool du bauen möchtest",
      "landing.howItWorks.step2": "Erlebe die Magie",
      "landing.howItWorks.step2Desc":
        "Unsere KI erstellt sofort deine App genau so, wie du sie beschrieben hast",
      "landing.howItWorks.step3": "Spielen & Testen",
      "landing.howItWorks.step3Desc":
        "Probiere deine Kreation aus und schaue, wie sie funktioniert",
      "landing.howItWorks.step4": "Mit Freunden teilen",
      "landing.howItWorks.step4Desc":
        "Zeige deine tolle Kreation Familie und Freunden",
      "landing.faq.title": "Häufig gestellte Fragen",
      "landing.faq.subtitle": "Alles, was Eltern über MiniCoder wissen möchten",
      "landing.faq.q1": "Ist MiniCoder sicher für mein Kind?",
      "landing.faq.a1":
        "Absolut! Wir sammeln keine persönlichen Daten, alle Inhalte werden moderiert und wir befolgen strenge Datenschutzrichtlinien für Kinder.",
      "landing.faq.q2": "Für welche Altersgruppe ist das gedacht?",
      "landing.faq.a2":
        "MiniCoder ist für Kinder konzipiert, aber auch neugierige ältere Kinder und sogar Erwachsene haben Spaß beim Erstellen!",
      "landing.faq.q3": "Muss mein Kind programmieren können?",
      "landing.faq.a3":
        "Überhaupt nicht! Kinder beschreiben einfach in normaler Sprache, was sie bauen möchten, und unsere KI erledigt die ganze technische Arbeit.",
      "landing.faq.q4": "Wie viel kostet es?",
      "landing.faq.a4":
        "MiniCoder ist kostenlos! Wir glauben, dass jedes Kind Zugang zu kreativen Technologie-Tools haben sollte.",
      "landing.faq.q5": "Kann mein Kind seine Kreationen teilen?",
      "landing.faq.a5":
        "Ja! Kinder können ihre Apps mit Familie und Freunden teilen oder sie in unserem moderierten Community-App-Store veröffentlichen.",
      "landing.faq.q6": "Welche Art von Apps können Kinder erstellen?",
      "landing.faq.a6":
        "Fast alles! Spiele, Taschenrechner, Zeichen-Tools, Quiz, Timer und vieles mehr. Wenn sie es sich vorstellen können, können sie es wahrscheinlich bauen.",
      "landing.faq.q7": "Gibt es elterliche Aufsicht?",
      "landing.faq.a7":
        "Ja! Eltern können alle Projekte überprüfen, Sharing-Einstellungen kontrollieren und die Aktivitäten ihres Kindes über unser Eltern-Dashboard überwachen.",
      "landing.faq.q8": "Funktioniert MiniCoder auf Tablets und Handys?",
      "landing.faq.a8":
        "MiniCoder funktioniert am besten auf Computern, ist aber auch mit Tablets kompatibel. Wir arbeiten an einer mobilen App, die bald erscheint!",
      "landing.faq.q9": "Wie lange dauert es, ein Spiel zu erstellen?",
      "landing.faq.a9":
        "Einfache Spiele können in nur wenigen Minuten erstellt werden! Komplexere Projekte können je nach Vorstellung des Kindes ein bis zwei Stunden dauern.",
      "landing.faq.q10":
        "Können mehrere Kinder zusammen an einem Projekt arbeiten?",
      "landing.faq.a10":
        "Derzeit wird jedes Projekt von einem Kind erstellt, aber Kinder können sich definitiv gegenseitig inspirieren, indem sie Spiele teilen und remixen!",
      "landing.faq.q11":
        "Was ist, wenn mein Kind frustriert wird oder nicht weiterkommt?",
      "landing.faq.a11":
        "Unser KI-Assistent ist darauf ausgelegt, geduldig und hilfsbereit zu sein. Wir bieten auch Schritt-für-Schritt-Tutorials und eine unterstützende Gemeinschaft junger Kreativer.",
      "landing.faq.q12": "Können Kinder echte Programmierfähigkeiten lernen?",
      "landing.faq.a12":
        "Während Kinder mit natürlicher Sprache beginnen, lernen sie allmählich Programmierkonzepte wie Schleifen, Bedingungen und Logik durch unsere visuellen Tools.",
      "landing.faq.q13": "Gibt es ein Zeitlimit für die Nutzung von MiniCoder?",
      "landing.faq.a13":
        "Eltern können Nutzungslimits über die Kindersicherung festlegen. Wir ermutigen auch zu gesunden Pausen mit eingebauten Erinnerungen.",
      "landing.faq.q14": "Welche Geräte und Browser werden unterstützt?",
      "landing.faq.a14":
        "MiniCoder funktioniert auf Windows, Mac und Chromebooks mit modernen Browsern wie Chrome, Firefox, Safari und Edge.",

      // CTA Section
      "landing.cta.title": "Bereit zum Erstellen?",
      "landing.cta.subtitle":
        "Schließe dich Tausenden junger Kreativer an, die tolle Spiele und Tools mit MiniCoder erstellen",
      "landing.cta.startCreating": "Kostenlos mit dem Erstellen beginnen",
      "landing.cta.browseApps": "Community-Apps durchsuchen",

      // Safety Section
      "landing.safety.title": "Mit Sicherheit im Fokus entwickelt",
      "landing.safety.subtitle":
        "Wir nehmen Kindersicherheit und Datenschutz ernst",
      "landing.safety.privacy": "Datenschutz zuerst",
      "landing.safety.privacyDesc":
        "Keine persönliche Datensammlung. Die Privatsphäre deines Kindes ist unsere oberste Priorität.",
      "landing.safety.moderation": "Inhalts-Moderation",
      "landing.safety.moderationDesc":
        "Alle geteilten Inhalte werden überprüft, um sicherzustellen, dass sie für Kinder geeignet sind.",
      "landing.safety.parentControl": "Elterliche Kontrolle",
      "landing.safety.parentControlDesc":
        "Eltern haben volle Transparenz und Kontrolle über die Kreationen und das Teilen ihres Kindes.",
      "landing.safety.secure": "Sichere Plattform",
      "landing.safety.secureDesc":
        "Unternehmenssicherheit auf höchstem Niveau schützt alle Benutzerdaten und Interaktionen.",
      "landing.safety.trustBadge": "Von Eltern vertraut",
      "landing.safety.mainTitle":
        "Die Sicherheit deines Kindes ist unsere Priorität",
      "landing.safety.mainSubtitle":
        "Wir haben MiniCoder mit den höchsten Sicherheits- und Datenschutzstandards entwickelt. Eltern können sich sicher fühlen, ihre Kinder erkunden und erstellen zu lassen.",
      "landing.safety.privacyFirstTitle": "Datenschutz-orientiertes Design",
      "landing.safety.privacyFirstDesc":
        "Wir sammeln niemals persönliche Informationen von Kindern. Keine E-Mail-Adressen, Namen oder Fotos erforderlich.",
      "landing.safety.secureTitle": "Sichere Plattform",
      "landing.safety.secureDesc2":
        "Alle Inhalte werden moderiert und Spiele laufen in einer sicheren, geschützten Umgebung ohne externen Zugriff.",
      "landing.safety.parentalTitle": "Elterliche Aufsicht",
      "landing.safety.parentalDesc":
        "Eltern können alle Spiele überprüfen, die ihre Kinder erstellen, und haben volle Kontrolle über die Sharing-Einstellungen.",
      "landing.safety.communityTitle": "Kindersichere Community",
      "landing.safety.communityDesc":
        "Alle geteilten Inhalte werden von unserem Sicherheitsteam überprüft. Keine Chat-Funktionen oder persönliche Nachrichten.",
      "landing.safety.complianceTitle": "COPPA & DSGVO Konform",
      "landing.safety.complianceText":
        "MiniCoder ist vollständig konform mit Kinderdatenschutzgesetzen einschließlich COPPA (Children's Online Privacy Protection Act) und DSGVO. Wir sind darauf spezialisiert, einen sicheren digitalen Spielplatz zu schaffen, wo Kreativität gedeihen kann.",
      "landing.safety.badgeCoppa": "✅ COPPA Konform",
      "landing.safety.badgeGdpr": "🔒 DSGVO Konform",
      "landing.safety.badgeModerated": "👥 Inhalte Moderiert",

      // Testimonials Section
      "landing.testimonials.title": "Was Familien sagen",
      "landing.testimonials.t1.text":
        "Meine Tochter hat ihr erstes Spiel in nur 10 Minuten erstellt! Sie ist so stolz und zeigt es allen.",
      "landing.testimonials.t1.author": "Sarah M.",
      "landing.testimonials.t1.role": "Mutter von Emma, 9",
      "landing.testimonials.t2.text":
        "Endlich eine Plattform, wo mein Sohn kreativ sein kann, ohne dass ich mir Sorgen über unangemessene Inhalte oder Datenschutz machen muss.",
      "landing.testimonials.t2.author": "Mike R.",
      "landing.testimonials.t2.role": "Vater von Alex, 8",
      "landing.testimonials.t3.text":
        "Die KI versteht genau, was ich machen möchte. Es ist wie ein magischer Programmier-Assistent!",
      "landing.testimonials.t3.author": "Lily K.",
      "landing.testimonials.t3.role": "12 Jahre alt",

      // Video Section
      "landing.video.title": "MiniCoder in Aktion erleben",
      "landing.video.subtitle":
        "Schaue zu, wie Kinder in wenigen Minuten tolle Spiele mit unserer KI-gestützten Plattform erstellen",
      "landing.video.playText": "Demo ansehen",
      "landing.video.feature1": "Echte Kinder, echte Kreationen",
      "landing.video.feature2": "Kein Programmieren erforderlich",
      "landing.video.feature3": "Sofortige Ergebnisse",

      // App Gallery Section
      "landing.gallery.title": "Community-Kreationen",
      "landing.gallery.subtitle":
        "Entdecke tolle Spiele und Tools, die von jungen Entwicklern wie dir erstellt wurden!",
      "landing.gallery.tryApp": "App ausprobieren",
      "landing.gallery.by": "Von",
      "landing.gallery.exploreMore": "Anmelden, um mehr Spiele zu entdecken",
      "landing.gallery.app1.title": "Simon Says-Spiel",
      "landing.gallery.app1.description":
        "Simon Says-Spiel mit Farben und Tönen",
      "landing.gallery.app2.title": "Käferrennen",
      "landing.gallery.app2.description":
        "Käferrennen mit Start- und Reset-Knopf",
      "landing.gallery.app3.title": "Tic-Tac-Toe-Spiel",
      "landing.gallery.app3.description": "Tic-Tac-Toe-Spiel für zwei Spieler",

      // Toolbox translations
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
      modifyApp: "Besser machen",
      modifyingApp: "Ändere deine App...",
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
      username: "Benutzername",
      name: "Name",
      emailPlaceholder: "E-Mail eingeben",
      passwordPlaceholder: "Passwort eingeben",
      usernamePlaceholder: "Benutzername eingeben",
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
      // Voice input translations
      voiceTips: "Sprach-Tipps",
      speakClearly: "Sprich klar und laut",
      findQuietPlace: "Finde einen ruhigen Ort",
      speakNaturally: "Sprich natürlich, nicht hetzen",
      weHeard: "Wir haben gehört",
      processing: "Verarbeite...",
      transcriptionReady: "Transkription fertig!",
      readyToListen: "Bereit dir zuzuhören!",
      speakNow: "Jetzt sprechen! 🎤",
      useThis: "Das verwenden",
      startRecording: "Aufnahme starten",
      stopRecording: "Aufnahme stoppen",
      tryAgain: "Nochmal versuchen",
      editTranscription: "Du kannst diesen Text bearbeiten, falls nötig...",
      recordingFailed: "Aufnahme fehlgeschlagen. Bitte nochmal versuchen!",
      recordingTooShort: "Aufnahme zu kurz. Bitte länger sprechen!",
    },
  };

  private readonly availableLanguages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ];

  constructor(private analytics: AnalyticsService) {
    // Set initial language in analytics
    this.analytics.setLanguage(this.selectedLanguageSubject.value);
  }

  getCurrentLanguage(): string {
    return this.selectedLanguageSubject.value;
  }

  setLanguage(languageCode: string): void {
    if (this.translations[languageCode]) {
      const previousLanguage = this.selectedLanguageSubject.value;
      this.selectedLanguageSubject.next(languageCode);

      // Update analytics language
      this.analytics.setLanguage(languageCode);
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
