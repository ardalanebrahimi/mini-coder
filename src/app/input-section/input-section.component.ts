import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";
import { TranslationService } from "../services/translation.service";
import {
  CommandInputService,
  CommandInputState,
} from "../services/command-input.service";
import { CommandActionsService } from "../services/command-actions.service";
import { EXAMPLE_COMMANDS } from "../examples";

@Component({
  selector: "app-input-section",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./input-section.component.html",
  styleUrls: ["./input-section.component.scss"],
})
export class InputSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state: CommandInputState = {
    userCommand: "",
    isProcessing: false,
    voiceSupported: false,
    isListening: false,
  };

  // Example suggestions
  currentSuggestions: string[] = [];
  showSuggestions = true;
  suggestionsCollapsed = true; // Track if suggestions are collapsed

  constructor(
    private translationService: TranslationService,
    private commandInputService: CommandInputService,
    private commandActionsService: CommandActionsService
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.commandInputService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.state = state;
      });

    // Subscribe to language changes and refresh suggestions
    this.translationService.selectedLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((languageCode) => {
        // Auto-refresh suggestions when language changes
        if (this.showSuggestions) {
          this.generateRandomSuggestions();
        }
      });

    // Generate initial suggestions
    this.generateRandomSuggestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get translation for current language
   */
  t(key: string): string {
    return this.translationService.t(key);
  }

  onUserCommandChange(value: string): void {
    this.commandInputService.updateUserCommand(value);
  }

  onProcessCommand(): void {
    this.showSuggestions = false; // Hide suggestions when processing command
    this.commandActionsService.processCommand();
  }

  onSetExampleCommand(): void {
    this.commandActionsService.setExampleCommand();
  }

  onStartVoiceInput(): void {
    this.commandActionsService.startVoiceInput();
  }

  onTestStaticPreview(): void {
    this.commandActionsService.testStaticPreview();
  }

  onTestBlobUrl(): void {
    this.commandActionsService.testBlobUrl();
  }

  /**
   * Generate random suggestions based on current language
   */
  generateRandomSuggestions(): void {
    const currentLanguage = this.translationService.getCurrentLanguage();
    const examples = this.getExampleCommands(currentLanguage);

    // Get 3 random examples
    const shuffled = [...examples].sort(() => 0.5 - Math.random());
    this.currentSuggestions = shuffled.slice(0, 3);
  }

  /**
   * Get example commands for the given language code, or fall back to English
   */
  getExampleCommands(language: string = "en"): string[] {
    return EXAMPLE_COMMANDS[language] || EXAMPLE_COMMANDS["en"];
  }

  /**
   * Handle suggestion click
   */
  onSuggestionClick(suggestion: string): void {
    this.commandInputService.updateUserCommand(suggestion);
    // Keep suggestions visible but collapse them to save space
    this.suggestionsCollapsed = true;
  }

  /**
   * Refresh suggestions
   */
  onRefreshSuggestions(): void {
    this.generateRandomSuggestions();
    // Expand suggestions when refreshing
    this.suggestionsCollapsed = false;
  }

  /**
   * Toggle suggestions visibility/expansion
   */
  toggleSuggestions(): void {
    if (this.showSuggestions) {
      this.suggestionsCollapsed = !this.suggestionsCollapsed;
    } else {
      this.showSuggestions = true;
      this.suggestionsCollapsed = false;
      this.generateRandomSuggestions();
    }
  }

  /**
   * Hide suggestions completely
   */
  hideSuggestions(): void {
    this.showSuggestions = false;
    this.suggestionsCollapsed = false;
  }
}
