import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { AdminNotificationService, AdminNotification } from '../../services/admin-notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSwitcherComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  themeService = inject(ThemeService);
  notifService = inject(AdminNotificationService);
  private router = inject(Router);
  private el = inject(ElementRef);

  showDropdown = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  handleNotifClick(notif: AdminNotification) {
    this.notifService.markAsRead(notif.id);
    this.showDropdown = false;
    this.router.navigateByUrl(`/recrutement?offreId=${notif.offreId}`);
  }

  markAllRead() {
    this.notifService.markAllAsRead();
    this.showDropdown = false;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
