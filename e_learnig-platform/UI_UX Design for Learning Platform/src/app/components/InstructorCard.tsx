import { Star, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface InstructorCardProps {
  name: string;
  title: string;
  specialty: string;
  courses: number;
  rating: number;
  students: string;
  image: string;
}

export function InstructorCard({
  name,
  title,
  specialty,
  courses,
  rating,
  students,
  image,
}: InstructorCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl group cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-square">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6 text-center">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-primary mb-1">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{specialty}</p>
        
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-semibold">{courses}</span>
            </div>
            <span className="text-xs text-muted-foreground">Courses</span>
          </div>
          
          <div className="h-8 w-px bg-border" />
          
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center mb-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-semibold">{rating}</span>
            </div>
            <span className="text-xs text-muted-foreground">Rating</span>
          </div>
          
          <div className="h-8 w-px bg-border" />
          
          <div className="text-center">
            <div className="font-semibold mb-1">{students}</div>
            <span className="text-xs text-muted-foreground">Students</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
