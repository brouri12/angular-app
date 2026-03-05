import { motion } from "motion/react";
import { InstructorCard } from "../components/InstructorCard";

export function Instructors() {
  const instructors = [
    {
      name: "Dr. Angela Yu",
      title: "Lead Instructor",
      specialty: "Web Development & App Development",
      courses: 12,
      rating: 4.9,
      students: "500K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Jose Portilla",
      title: "Data Science Expert",
      specialty: "Python, Machine Learning & Data Analysis",
      courses: 15,
      rating: 4.8,
      students: "750K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Daniel Scott",
      title: "Design Specialist",
      specialty: "UI/UX Design & Graphic Design",
      courses: 18,
      rating: 4.9,
      students: "450K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Maximilian Schwarzmüller",
      title: "Full Stack Developer",
      specialty: "React, Node.js & Web Development",
      courses: 20,
      rating: 4.9,
      students: "850K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Jonas Schmedtmann",
      title: "JavaScript Expert",
      specialty: "JavaScript, CSS & Frontend Development",
      courses: 10,
      rating: 4.9,
      students: "600K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Stephane Maarek",
      title: "Cloud Architect",
      specialty: "AWS, DevOps & Cloud Computing",
      courses: 14,
      rating: 4.9,
      students: "900K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Phil Ebiner",
      title: "Marketing Strategist",
      specialty: "Digital Marketing & Business Growth",
      courses: 16,
      rating: 4.7,
      students: "380K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Andrei Neagoie",
      title: "Senior Developer",
      specialty: "Career Development & Programming",
      courses: 13,
      rating: 4.8,
      students: "550K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      name: "Colt Steele",
      title: "Bootcamp Instructor",
      specialty: "Web Development & Computer Science",
      courses: 11,
      rating: 4.8,
      students: "480K+",
      image: "https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDgwNjkxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Meet Our Expert Instructors
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn from industry professionals with years of real-world experience and a passion for teaching
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8"
        >
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              100+
            </div>
            <div className="text-sm text-muted-foreground">Expert Instructors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              500+
            </div>
            <div className="text-sm text-muted-foreground">Courses Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              5M+
            </div>
            <div className="text-sm text-muted-foreground">Students Taught</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
              4.8
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </div>
        </motion.div>

        {/* Instructors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor, index) => (
            <motion.div
              key={instructor.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <InstructorCard {...instructor} />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4">Want to Become an Instructor?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Share your expertise with millions of students around the world. Join our community of expert instructors and earn income doing what you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Apply to Teach
            </button>
            <button className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
