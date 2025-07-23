import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export enum BuildChoiceType {
  MODIFY_EXISTING = "modify",
  REBUILD_FROM_SCRATCH = "rebuild",
}

export interface BuildChoiceResult {
  choice: BuildChoiceType;
}

@Injectable({
  providedIn: "root",
})
export class BuildChoiceDialogService {
  private showDialogSubject = new BehaviorSubject<boolean>(false);
  private choiceSubject = new BehaviorSubject<BuildChoiceResult | null>(null);

  showDialog$ = this.showDialogSubject.asObservable();
  choice$ = this.choiceSubject.asObservable();

  constructor() {}

  /**
   * Open the build choice dialog
   */
  openDialog(): void {
    this.showDialogSubject.next(true);
    this.choiceSubject.next(null); // Reset previous choice
  }

  /**
   * Close the build choice dialog
   */
  closeDialog(): void {
    this.showDialogSubject.next(false);
  }

  /**
   * User selected modify existing
   */
  selectModifyExisting(): void {
    this.choiceSubject.next({ choice: BuildChoiceType.MODIFY_EXISTING });
    this.closeDialog();
  }

  /**
   * User selected rebuild from scratch
   */
  selectRebuildFromScratch(): void {
    this.choiceSubject.next({ choice: BuildChoiceType.REBUILD_FROM_SCRATCH });
    this.closeDialog();
  }

  /**
   * Get current dialog state
   */
  isDialogOpen(): boolean {
    return this.showDialogSubject.value;
  }
}
