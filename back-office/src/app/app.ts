import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';
import { AuthModal } from './components/auth-modal/auth-modal';
import { NotificationComponent } from './components/notification/notification';
import { Theme } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Topbar, AuthModal, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private themeService: Theme) {}
}
