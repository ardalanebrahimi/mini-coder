import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CommandInputState {
  userCommand: string;
  isProcessing: boolean;
  voiceSupported: boolean;
  isListening: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommandInputService {
  private stateSubject = new BehaviorSubject<CommandInputState>({
    userCommand: '',
    isProcessing: false,
    voiceSupported: false,
    isListening: false
  });

  public state$ = this.stateSubject.asObservable();

  get currentState(): CommandInputState {
    return this.stateSubject.value;
  }

  updateUserCommand(command: string): void {
    this.updateState({ userCommand: command });
  }

  setProcessing(isProcessing: boolean): void {
    this.updateState({ isProcessing });
  }

  setVoiceSupported(voiceSupported: boolean): void {
    this.updateState({ voiceSupported });
  }

  setListening(isListening: boolean): void {
    this.updateState({ isListening });
  }

  clearCommand(): void {
    this.updateState({ userCommand: '' });
  }

  reset(): void {
    this.stateSubject.next({
      userCommand: '',
      isProcessing: false,
      voiceSupported: this.currentState.voiceSupported, // Keep voice support status
      isListening: false
    });
  }

  private updateState(partialState: Partial<CommandInputState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      ...partialState
    });
  }
}
