import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  imports: [CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp 2026',
      instructor: 'Dr. Angela Yu',
      category: 'Development',
      students: 1234,
      price: '$89.99',
      status: 'Published',
      rating: 4.9
    },
    {
      id: 2,
      title: 'Data Science & Machine Learning',
      instructor: 'Jose Portilla',
      category: 'Data Science',
      students: 987,
      price: '$94.99',
      status: 'Published',
      rating: 4.8
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Daniel Scott',
      category: 'Design',
      students: 756,
      price: '$79.99',
      status: 'Published',
      rating: 4.9
    },
    {
      id: 4,
      title: 'Mobile App Development with React Native',
      instructor: 'Maximilian Schwarzmüller',
      category: 'Development',
      students: 543,
      price: '$84.99',
      status: 'Draft',
      rating: 0
    }
  ];
}
