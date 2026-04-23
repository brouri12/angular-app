import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-join-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-confirm-modal.component.html',
  styleUrls: ['./join-confirm-modal.component.css'],
})
export class JoinConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirm Join';
  @Input() message = 'Voulez-vous confirmer ?';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.cancel.emit();
    }
  }
}