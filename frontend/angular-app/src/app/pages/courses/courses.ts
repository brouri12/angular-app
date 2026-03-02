import { Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  imports: [],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  courses = [
    {
      title: 'Complete Web Development Bootcamp 2026',
      instructor: 'Dr. Angela Yu',
      price: '$89.99',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      category: 'Development',
    },
    {
      title: 'Data Science & Machine Learning with Python',
      instructor: 'Jose Portilla',
      price: '$94.99',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      category: 'Data Science',
    },
    {
      title: 'UI/UX Design: Figma & Adobe XD Masterclass',
      instructor: 'Daniel Scott',
      price: '$79.99',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      category: 'Design',
    },
  ];
}
