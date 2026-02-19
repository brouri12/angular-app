import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  limitations?: string[];
  popular: boolean;
}

@Component({
  selector: 'app-pricing',
  imports: [CommonModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class Pricing {
  billingCycle = signal<'monthly' | 'annual'>('monthly');

  plans: Plan[] = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: '$0',
      annualPrice: '$0',
      features: [
        'Access to 5 free courses',
        'Basic community support',
        'Course certificates',
        'Mobile app access',
      ],
      limitations: [
        'No premium courses',
        'No live sessions',
        'No career support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      description: 'Best for serious learners',
      monthlyPrice: '$29',
      annualPrice: '$290',
      features: [
        'Access to all 500+ courses',
        'Priority support 24/7',
        'All certificates included',
        'Downloadable resources',
        'Monthly live sessions',
        'Career guidance',
        'Project reviews',
        'Ad-free experience',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations',
      monthlyPrice: '$99',
      annualPrice: '$990',
      features: [
        'Everything in Pro',
        'Up to 50 team members',
        'Custom learning paths',
        'Advanced analytics',
        'Dedicated account manager',
        'API access',
        'SSO integration',
        'Custom branding',
        'Onboarding assistance',
      ],
      popular: false,
    },
  ];

  faqs = [
    {
      q: 'Can I switch plans later?',
      a: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes, all paid plans come with a 7-day free trial. No credit card required for the Free plan.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
    },
    {
      q: 'Can I get a refund?',
      a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.',
    },
  ];

  setBillingCycle(cycle: 'monthly' | 'annual') {
    this.billingCycle.set(cycle);
  }

  getPrice(plan: Plan): string {
    return this.billingCycle() === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  }

  getSavings(): string {
    return this.billingCycle() === 'annual' ? 'Save 17%' : '';
  }
}
