import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Features } from './features/features';
import { NavBar } from './nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [Features, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('UI');
}
