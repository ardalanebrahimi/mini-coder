import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProcessedCommand } from './prompt-processor.service';

export interface SaveDialogData {
  currentApp: ProcessedCommand;
  userCommand: string;
}

@Injectable({
  providedIn: 'root'
})
export class SaveDialogService {
  private showDialogSubject = new BehaviorSubject<boolean>(false);
  private dialogDataSubject = new BehaviorSubject<SaveDialogData | null>(null);

  showDialog$ = this.showDialogSubject.asObservable();
  dialogData$ = this.dialogDataSubject.asObservable();

  constructor() {}

  /**
   * Open the save dialog with the provided data
   */
  openDialog(data: SaveDialogData): void {
    this.dialogDataSubject.next(data);
    this.showDialogSubject.next(true);
  }

  /**
   * Close the save dialog
   */
  closeDialog(): void {
    this.showDialogSubject.next(false);
    this.dialogDataSubject.next(null);
  }

  /**
   * Get current dialog state
   */
  isDialogOpen(): boolean {
    return this.showDialogSubject.value;
  }

  /**
   * Get current dialog data
   */
  getCurrentDialogData(): SaveDialogData | null {
    return this.dialogDataSubject.value;
  }
}
