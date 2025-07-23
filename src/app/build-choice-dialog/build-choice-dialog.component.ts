import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  BuildChoiceDialogService,
  BuildChoiceType,
} from "../services/build-choice-dialog.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-build-choice-dialog",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./build-choice-dialog.component.html",
  styleUrls: ["./build-choice-dialog.component.scss"],
})
export class BuildChoiceDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  showDialog = false;

  constructor(
    private buildChoiceDialogService: BuildChoiceDialogService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to dialog visibility
    this.buildChoiceDialogService.showDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showDialog = show;
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

  /**
   * Handle dialog overlay click (close dialog)
   */
  onOverlayClick(): void {
    this.cancelChoice();
  }

  /**
   * Handle dialog content click (prevent event bubbling)
   */
  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Cancel choice and close dialog
   */
  cancelChoice(): void {
    this.buildChoiceDialogService.closeDialog();
  }

  /**
   * Choose to modify existing app
   */
  chooseModifyExisting(): void {
    this.buildChoiceDialogService.selectModifyExisting();
  }

  /**
   * Choose to rebuild from scratch
   */
  chooseRebuildFromScratch(): void {
    this.buildChoiceDialogService.selectRebuildFromScratch();
  }
}
