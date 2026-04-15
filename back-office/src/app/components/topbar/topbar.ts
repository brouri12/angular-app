import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  constructor(public themeService: Theme) {}
}
