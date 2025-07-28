import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import {
  PreviewSectionService,
  PreviewData,
} from "../services/preview-section.service";
import { TranslationService } from "../services/translation.service";

@Component({
  selector: "app-preview-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./preview-section.component.html",
  styleUrls: ["./preview-section.component.scss"],
})
export class PreviewSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  previewData: PreviewData = {
    currentApp: null,
    previewHtml: "",
    previewUrl: "",
    safePreviewUrl: null,
    userCommand: "",
  };

  constructor(
    private previewSectionService: PreviewSectionService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to preview data changes
    this.previewSectionService.previewData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.previewData = data;
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
   * Check if current app is read-only (from App Store)
   */
  get isReadOnly(): boolean {
    return this.previewData.currentApp?.isReadOnly === true;
  }

  /**
   * Handle modify button click
   */
  onModifyClick(): void {
    this.previewSectionService.emitAction("modify");
  }

  /**
   * Handle save button click
   */
  onSaveClick(): void {
    this.previewSectionService.emitAction("save");
  }

  /**
   * Handle clear button click
   */
  onClearClick(): void {
    this.previewSectionService.emitAction("clear");
  }

  /**
   * Handle iframe load event
   */
  onIframeLoad(event: any): void {
    console.log("Iframe loaded successfully");
    console.log("Event:", event);
    console.log("Event target:", event.target);
    console.log("Event target src:", event.target.src);
    console.log("Event target sandbox:", event.target.sandbox);

    const iframe = event.target;
    try {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDocument) {
        console.log("Iframe document accessible");
        console.log("Iframe document title:", iframeDocument.title);
        console.log("Iframe document URL:", iframeDocument.URL);
        console.log("Iframe document readyState:", iframeDocument.readyState);
        console.log(
          "Iframe document body innerHTML length:",
          iframeDocument.body?.innerHTML?.length || 0
        );
        console.log(
          "Iframe document has script tags:",
          iframeDocument.querySelectorAll("script").length
        );
        console.log(
          "Iframe document has style tags:",
          iframeDocument.querySelectorAll("style").length
        );
        console.log(
          "Iframe document body preview:",
          iframeDocument.body?.innerHTML?.substring(0, 200) || "No body content"
        );
      } else {
        console.log("Iframe document not accessible");
      }
    } catch (error) {
      console.log(
        "Cannot access iframe content (security restrictions):",
        error
      );
    }
  }

  /**
   * Handle iframe error event
   */
  onIframeError(event: any): void {
    console.error("Iframe error:", event);
    console.error("Iframe error event target:", event.target);
    console.error("Iframe error event type:", event.type);
    // Emit error through service if needed
    // this.previewSectionService.emitError("Failed to load app preview. Check console for details.");
  }
}
