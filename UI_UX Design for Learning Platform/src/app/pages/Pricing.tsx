import { useState } from "react";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: "$0",
      annualPrice: "$0",
      features: [
        "Access to 5 free courses",
        "Basic community support",
        "Course certificates",
        "Mobile app access",
      ],
      limitations: [
        "No premium courses",
        "No live sessions",
        "No career support",
      ],
      popular: false,
    },
    {
      name: "Pro",
      description: "Best for serious learners",
      monthlyPrice: "$29",
      annualPrice: "$290",
      features: [
        "Access to all 500+ courses",
        "Priority support 24/7",
        "All certificates included",
        "Downloadable resources",
        "Monthly live sessions",
        "Career guidance",
        "Project reviews",
        "Ad-free experience",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      monthlyPrice: "$99",
      annualPrice: "$990",
      features: [
        "Everything in Pro",
        "Up to 50 team members",
        "Custom learning paths",
        "Advanced analytics",
        "Dedicated account manager",
        "API access",
        "SSO integration",
        "Custom branding",
        "Onboarding assistance",
      ],
      popular: false,
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = () => {
    return billingCycle === "annual" ? "Save 17%" : "";
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Flexible pricing options to fit your learning journey
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-secondary rounded-full p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === "monthly"
                  ? "bg-background shadow-sm font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-background shadow-sm font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Annual
              {billingCycle === "annual" && (
                <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl border-2 overflow-hidden ${
                plan.popular
                  ? "border-primary shadow-2xl scale-105"
                  : "border-border hover:border-primary/50"
              } transition-all`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-white px-4 py-1 text-sm font-semibold">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice !== "$0" && (
                      <span className="text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    )}
                  </div>
                  {billingCycle === "annual" && plan.monthlyPrice !== "$0" && (
                    <p className="text-sm text-accent mt-2">{getSavings()}</p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      : ""
                  }`}
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.name === "Free" ? "Get Started" : "Start Free Trial"}
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  <p className="font-semibold text-sm">What's included:</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations?.map((limitation) => (
                    <div key={limitation} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-3 h-0.5 bg-muted-foreground" />
                      </div>
                      <span className="text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, all paid plans come with a 7-day free trial. No credit card required for the Free plan.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you find the perfect plan for your needs.
          </p>
          <Button size="lg" variant="outline">
            Contact Sales
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
