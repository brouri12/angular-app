import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { NotificationComponent } from './components/notification/notification';
import { Theme } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private themeService: Theme) {}
}
