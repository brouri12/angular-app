import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  stats = [
    { value: '100K+', label: 'Active Learners' },
    { value: '500+', label: 'Expert Courses' },
    { value: '95%', label: 'Completion Rate' },
    { value: '4.9', label: 'Average Rating' },
  ];

  benefits = [
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience.',
    },
    {
      title: 'Lifetime Access',
      description: 'Access your courses anytime, anywhere with lifetime updates included.',
    },
    {
      title: 'Career Support',
      description: 'Get personalized career guidance and job placement assistance.',
    },
    {
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion to boost your career.',
    },
  ];
}
