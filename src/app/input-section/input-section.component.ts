import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../services/translation.service';
import { CommandInputService, CommandInputState } from '../services/command-input.service';
import { CommandActionsService } from '../services/command-actions.service';

@Component({
  selector: 'app-input-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.component.html',
  styleUrls: ['./input-section.component.scss']
})
export class InputSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  state: CommandInputState = {
    userCommand: '',
    isProcessing: false,
    voiceSupported: false,
    isListening: false
  };

  constructor(
    private translationService: TranslationService,
    private commandInputService: CommandInputService,
    private commandActionsService: CommandActionsService
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.commandInputService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
      });
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
}
