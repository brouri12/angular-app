import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-test-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-8">
      <h1 class="text-3xl font-bold mb-8">Test Notification System</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          (click)="testSuccess()"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Test Success
        </button>
        
        <button 
          (click)="testError()"
          class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Test Error
        </button>
        
        <button 
          (click)="testWarning()"
          class="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
          Test Warning
        </button>
        
        <button 
          (click)="testInfo()"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Test Info
        </button>
        
        <button 
          (click)="testConfirm()"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
          Test Confirm
        </button>
      </div>
      
      <div class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">Instructions:</h2>
        <p>Click any button above to test the notification system.</p>
        <p class="mt-2">If notifications don't appear, check the browser console for errors.</p>
      </div>
    </div>
  `
})
export class TestNotifications {
  private notificationService = inject(NotificationService);

  testSuccess() {
    console.log('Testing success notification...');
    this.notificationService.success('Success!', 'This is a success notification.');
  }

  testError() {
    console.log('Testing error notification...');
    this.notificationService.error('Error!', 'This is an error notification.');
  }

  testWarning() {
    console.log('Testing warning notification...');
    this.notificationService.warning('Warning!', 'This is a warning notification.');
  }

  testInfo() {
    console.log('Testing info notification...');
    this.notificationService.info('Info', 'This is an info notification.');
  }

  testConfirm() {
    console.log('Testing confirm dialog...');
    this.notificationService.confirm(
      'Confirm Action',
      'Are you sure you want to proceed?',
      () => {
        console.log('User confirmed!');
        this.notificationService.success('Confirmed', 'You clicked Confirm!');
      },
      () => {
        console.log('User cancelled!');
        this.notificationService.info('Cancelled', 'You clicked Cancel!');
      }
    );
  }
}
