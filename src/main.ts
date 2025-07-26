import { bootstrapApplication } from "@angular/platform-browser";
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { importProvidersFrom } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { provideRouter, Routes } from "@angular/router";

import { RootComponent } from "./app/root.component";
import { AppComponent } from "./app/app.component";
import { LoginComponent } from "./app/auth/login.component";
import { RegisterComponent } from "./app/auth/register.component";
import { AuthInterceptor } from "./app/services/auth.interceptor";
import { AuthGuard } from "./app/services/auth.guard";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "home", component: AppComponent, canActivate: [AuthGuard] },
  { path: "", redirectTo: "/home", pathMatch: "full" },
];

bootstrapApplication(RootComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
