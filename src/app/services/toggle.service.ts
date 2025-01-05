import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToggleService {

  private _toggleValue: boolean = false; // Private variable to hold the current toggle value
  toggleValue$ = new Subject<boolean>(); // Observable for broadcasting toggle value changes to subscribers

  /**
   * Getter for the toggle value.
   * @returns The current value of the toggle.
   */
  get toggleValue(): boolean {
    // Returns the current value of the toggle.
    return this._toggleValue;
  }

  /**
   * Updates the toggle value and notifies subscribers about the change.
   * @param value - The new toggle value to set.
   */
  setToggleValue(value: boolean): void {
    // Update the private toggle value.
    this._toggleValue = value;
    
    // Emit the new toggle value to all subscribers.
    this.toggleValue$.next(value);
  }
}