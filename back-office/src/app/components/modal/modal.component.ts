import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-btn" (click)="close()" type="button">
            <span>&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.3s ease-out;
    }

    :host-context(.dark) .modal-container {
      background: #1f2937;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    :host-context(.dark) .modal-header {
      border-bottom-color: #374151;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    :host-context(.dark) .modal-header h2 {
      color: #f9fafb;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    :host-context(.dark) .close-btn {
      color: #9ca3af;
    }

    .close-btn:hover {
      background-color: #f3f4f6;
      color: #1f2937;
    }

    :host-context(.dark) .close-btn:hover {
      background-color: #374151;
      color: #f9fafb;
    }

    .modal-body {
      padding: 24px;
    }

    /* Scrollbar styling */
    .modal-container::-webkit-scrollbar {
      width: 8px;
    }

    .modal-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    :host-context(.dark) .modal-container::-webkit-scrollbar-track {
      background: #374151;
    }

    .modal-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    .modal-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent) {
    this.close();
  }
}
