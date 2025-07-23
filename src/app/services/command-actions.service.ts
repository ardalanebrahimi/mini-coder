import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface CommandAction {
  type:
    | "PROCESS_COMMAND"
    | "SET_EXAMPLE"
    | "START_VOICE"
    | "TEST_STATIC"
    | "TEST_BLOB";
  payload?: any;
}

@Injectable({
  providedIn: "root",
})
export class CommandActionsService {
  private actionSubject = new Subject<CommandAction>();
  public actions$ = this.actionSubject.asObservable();

  processCommand(): void {
    this.actionSubject.next({ type: "PROCESS_COMMAND" });
  }

  setExampleCommand(): void {
    this.actionSubject.next({ type: "SET_EXAMPLE" });
  }

  startVoiceInput(): void {
    this.actionSubject.next({ type: "START_VOICE" });
  }

  testStaticPreview(): void {
    this.actionSubject.next({ type: "TEST_STATIC" });
  }

  testBlobUrl(): void {
    this.actionSubject.next({ type: "TEST_BLOB" });
  }
}
