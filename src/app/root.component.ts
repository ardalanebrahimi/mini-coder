import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./shared/header.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      main {
        min-height: calc(100vh - 80px);
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class RootComponent {
  title = "mini-coder-frontend";
}
