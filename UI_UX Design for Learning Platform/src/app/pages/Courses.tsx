import { useState } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const allCourses = [
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
    {
      title: "React - The Complete Guide 2026",
      instructor: "Maximilian Schwarzmüller",
      price: "$84.99",
      rating: 4.9,
      students: "156K",
      duration: "48h",
      image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NzA4NTM5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Development",
      level: "Intermediate",
    },
    {
      title: "Python for Data Science and Machine Learning",
      instructor: "Jose Portilla",
      price: "$89.99",
      rating: 4.8,
      students: "142K",
      duration: "40h",
      image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzA4MDMzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Data Science",
      level: "Beginner",
    },
    {
      title: "Digital Marketing Masterclass",
      instructor: "Phil Ebiner",
      price: "$74.99",
      rating: 4.7,
      students: "89K",
      duration: "32h",
      image: "https://images.unsplash.com/photo-1629360021730-3d258452c425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3B8ZW58MXx8fHwxNzcwNzc3MzQ4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Business",
      level: "All Levels",
    },
    {
      title: "Advanced CSS and Sass: Flexbox, Grid, Animations",
      instructor: "Jonas Schmedtmann",
      price: "$79.99",
      rating: 4.9,
      students: "112K",
      duration: "28h",
      image: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMGNvZGluZ3xlbnwxfHx8fDE3NzA4NTM5MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Development",
      level: "Advanced",
    },
    {
      title: "Graphic Design Bootcamp",
      instructor: "Daniel Scott",
      price: "$84.99",
      rating: 4.8,
      students: "94K",
      duration: "36h",
      image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDgyNzEwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Design",
      level: "Beginner",
    },
    {
      title: "AWS Certified Solutions Architect",
      instructor: "Stephane Maarek",
      price: "$99.99",
      rating: 4.9,
      students: "178K",
      duration: "56h",
      image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzA4MDMzNjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Development",
      level: "Advanced",
    },
  ];

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "all" || course.category === category;
    const matchesLevel = level === "all" || course.level === level;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
          <p className="text-muted-foreground text-lg">
            Discover {allCourses.length}+ courses to help you achieve your goals
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses by title or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <CourseCard {...course} />
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
                setLevel("all");
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
