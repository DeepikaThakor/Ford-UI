import { Component } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
   mobileOpen = false;
 
  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }
 
  closeMobile(): void {
    this.mobileOpen = false;
  }
}
