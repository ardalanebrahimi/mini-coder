import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private showProfileSubject = new BehaviorSubject<boolean>(false);
  public showProfile$ = this.showProfileSubject.asObservable();

  openProfile(): void {
    this.showProfileSubject.next(true);
  }

  closeProfile(): void {
    this.showProfileSubject.next(false);
  }

  isProfileOpen(): boolean {
    return this.showProfileSubject.value;
  }
}
