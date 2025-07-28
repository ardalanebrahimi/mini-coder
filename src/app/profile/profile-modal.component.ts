import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileComponent } from "./profile.component";

@Component({
  selector: "app-profile-modal",
  standalone: true,
  imports: [CommonModule, ProfileComponent],
  template: `
    <div
      class="profile-modal-overlay"
      *ngIf="isOpen"
      (click)="onOverlayClick($event)"
    >
      <div class="profile-modal-content" (click)="$event.stopPropagation()">
        <div class="profile-modal-header">
          <button class="close-button" (click)="onClose()" type="button">
            <span>&times;</span>
          </button>
        </div>
        <app-profile></app-profile>
      </div>
    </div>
  `,
  styleUrls: ["./profile-modal.component.scss"],
})
export class ProfileModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
