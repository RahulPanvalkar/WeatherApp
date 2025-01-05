import { Component, NgZone, ViewChild, ElementRef } from '@angular/core';

// Declaration of Bootstrap to access its offcanvas features
declare const bootstrap: any;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
})
export class SidenavComponent {
  
  // Reference to the offcanvas sidebar element
  @ViewChild('sidebarElement') sidebarElement!: ElementRef;
  
  // Boolean flag to track sidebar open/closed state
  sidebarOpen: boolean = false;
  
  // Inject NgZone for running tasks outside Angular's zone
  constructor(private ngZone: NgZone) { }

  // Method to toggle the sidebar open
  toggleSidebar() {
    this.sidebarOpen = true; // Set the sidebar open flag
    this.ngZone.runOutsideAngular(() => {
      // Initialize and show the Bootstrap offcanvas instance
      const sidebar = bootstrap.Offcanvas.getOrCreateInstance(this.sidebarElement.nativeElement);
      sidebar.show();
    });
  }

  // Method to close the sidebar
  closeSidebar() {
    this.sidebarOpen = false; // Set the sidebar open flag to false
  }

  // Lifecycle hook called after the view has been initialized
  ngAfterViewInit() {
    const sidebarElement = this.sidebarElement.nativeElement;

    // Listen for Bootstrap's sidebar hide event
    sidebarElement.addEventListener('hide.bs.offcanvas', () => {
      this.sidebarOpen = false; // Update the sidebar open flag on hide
    });
  }
}