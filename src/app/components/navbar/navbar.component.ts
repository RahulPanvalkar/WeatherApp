import { Component } from '@angular/core';
import { ToggleService } from '../../services/toggle.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private toggleService: ToggleService) {} // Inject ToggleService to manage toggle state

  /**
   * Handles the toggle switch change event.
   * Updates the toggle value in ToggleService to reflect the user's preference.
   */
  toggleUnits(): void {
    this.toggleService.setToggleValue(!this.toggleService.toggleValue); // Toggle the unit preference
    // console.log("toggleValue changed => ",!this.toggleService.toggleValue);
  }
}
