import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  stats = [
    { value: '500+', label: 'Expert Courses' },
    { value: '100K+', label: 'Active Students' },
    { value: '50+', label: 'Industry Partners' },
    { value: '95%', label: 'Success Rate' },
  ];

  benefits = [
    {
      title: 'Learn at Your Pace',
      description: 'Access courses anytime, anywhere. Learn on your schedule with lifetime access.',
    },
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of real-world experience.',
    },
    {
      title: 'Practical Projects',
      description: 'Build your portfolio with hands-on projects and real-world applications.',
    },
    {
      title: 'Career Support',
      description: 'Get guidance on your career path with our dedicated support team.',
    },
  ];

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

  pricingPlans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: '$0',
      popular: false,
      features: [
        'Access to 5 free courses',
        'Basic community support',
        'Course certificates',
        'Mobile app access',
      ],
    },
    {
      name: 'Pro',
      description: 'Best for serious learners',
      price: '$29',
      popular: true,
      features: [
        'Access to all 500+ courses',
        'Priority support 24/7',
        'All certificates included',
        'Downloadable resources',
        'Monthly live sessions',
        'Career guidance',
      ],
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations',
      price: '$99',
      popular: false,
      features: [
        'Everything in Pro',
        'Up to 50 team members',
        'Custom learning paths',
        'Advanced analytics',
        'Dedicated account manager',
      ],
    },
  ];

  values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in every course, ensuring the highest quality education.',
    },
    {
      title: 'Innovation',
      description: 'We embrace innovation and stay ahead of industry trends to provide cutting-edge content.',
    },
    {
      title: 'Community',
      description: 'We foster a supportive community where learners can connect, collaborate, and grow together.',
    },
  ];

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
