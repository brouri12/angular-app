import { motion } from "motion/react";
import { Link } from "react-router";
import { Users, BookOpen, Award, Star, CheckCircle, Zap, Target, Briefcase, ArrowRight, Code, Palette, BarChart, TrendingUp, Camera, Lightbulb } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatsCard } from "../components/StatsCard";
import { CourseCard } from "../components/CourseCard";
import { CategoryCard } from "../components/CategoryCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  const stats = [
    { icon: Users, value: "100K+", label: "Active Learners" },
    { icon: BookOpen, value: "500+", label: "Expert Courses" },
    { icon: Award, value: "95%", label: "Completion Rate" },
    { icon: Star, value: "4.9", label: "Average Rating" },
  ];

  const popularCourses = [
    {
      title: "Complete Web Development Bootcamp 2026",
      instructor: "Dr. Angela Yu",
      price: "$89.99",
      rating: 4.9,
      students: "125K",
      duration: "52h",
      image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NzA4NTM5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Development",
      level: "Beginner",
    },
    {
      title: "Data Science & Machine Learning with Python",
      instructor: "Jose Portilla",
      price: "$94.99",
      rating: 4.8,
      students: "98K",
      duration: "44h",
      image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzA4MDMzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Data Science",
      level: "Intermediate",
    },
    {
      title: "UI/UX Design: Figma & Adobe XD Masterclass",
      instructor: "Daniel Scott",
      price: "$79.99",
      rating: 4.9,
      students: "87K",
      duration: "36h",
      image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDgyNzEwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Design",
      level: "All Levels",
    },
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience.",
    },
    {
      icon: Zap,
      title: "Lifetime Access",
      description: "Access your courses anytime, anywhere with lifetime updates included.",
    },
    {
      icon: Target,
      title: "Career Support",
      description: "Get personalized career guidance and job placement assistance.",
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn recognized certificates upon course completion to boost your career.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">New courses added weekly</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Forge Your Future with{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Expert-Led Courses
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Master cutting-edge skills with industry experts. Learn at your own pace and unlock your full potential with SkillForge's comprehensive online courses.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary">100K+</div>
                  <div className="text-sm text-muted-foreground">Happy Students</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-accent">4.9/5</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1629360021730-3d258452c425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzcwNzc3MzQ4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Student learning online"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={stat.label}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Popular Courses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular courses taught by industry experts
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard {...course} />
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button size="lg" variant="outline" asChild>
              <Link to="/courses">
                View All Courses
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1660463531472-a86bb8f9f48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBpbnN0cnVjdG9yJTIwdGVhY2hpbmd8ZW58MXx8fHwxNzcwNzY1MDgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Professional instructor"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Our Story & Mission
              </h2>
              <p className="text-muted-foreground mb-6">
                Founded in 2020, SkillForge was born from a simple belief: everyone deserves access to quality education. We've grown from a small team of passionate educators to a global platform serving over 100,000 learners worldwide.
              </p>
              <p className="text-muted-foreground mb-8">
                Our mission is to empower individuals with the skills they need to thrive in today's rapidly evolving digital landscape. We partner with industry experts to create courses that are not just educational, but transformational.
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose SkillForge?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're more than just a learning platform. We're your partner in success.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Become Instructor CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <Briefcase className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Become an Instructor
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Share your expertise with millions of learners worldwide. Join our community of expert instructors and make an impact.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Start Teaching Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}