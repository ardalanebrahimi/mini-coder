import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ProcessedCommand } from "./prompt-processor.service";

export enum ModifyMode {
  MODIFY = "modify",
  REBUILD = "rebuild",
}

export interface ModifyDialogData {
  mode: ModifyMode;
  currentApp: ProcessedCommand | null;
  userCommand: string;
}

export interface ModifyResult {
  command: string;
  mode: ModifyMode;
}

@Injectable({
  providedIn: "root",
})
export class ModifyAppDialogService {
  private showDialogSubject = new BehaviorSubject<boolean>(false);
  private dialogDataSubject = new BehaviorSubject<ModifyDialogData | null>(
    null
  );
  private resultSubject = new BehaviorSubject<ModifyResult | null>(null);

  showDialog$ = this.showDialogSubject.asObservable();
  dialogData$ = this.dialogDataSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  constructor() {}

  /**
   * Open the modify dialog in modify mode
   */
  openModifyDialog(
    currentApp: ProcessedCommand | null,
    userCommand: string
  ): void {
    this.dialogDataSubject.next({
      mode: ModifyMode.MODIFY,
      currentApp,
      userCommand,
    });
    this.showDialogSubject.next(true);
    this.resultSubject.next(null); // Reset previous result
  }

  /**
   * Open the modify dialog in rebuild mode
   */
  openRebuildDialog(
    currentApp: ProcessedCommand | null,
    userCommand: string
  ): void {
    this.dialogDataSubject.next({
      mode: ModifyMode.REBUILD,
      currentApp,
      userCommand,
    });
    this.showDialogSubject.next(true);
    this.resultSubject.next(null); // Reset previous result
  }

  /**
   * Close the modify dialog
   */
  closeDialog(): void {
    this.showDialogSubject.next(false);
    this.dialogDataSubject.next(null);
  }

  /**
   * Submit the modify/rebuild command
   */
  submitCommand(command: string): void {
    const dialogData = this.dialogDataSubject.value;
    if (dialogData) {
      this.resultSubject.next({
        command,
        mode: dialogData.mode,
      });
      this.closeDialog();
    }
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
  getCurrentDialogData(): ModifyDialogData | null {
    return this.dialogDataSubject.value;
  }
}
