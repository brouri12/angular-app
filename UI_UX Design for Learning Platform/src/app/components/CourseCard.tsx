import { Star, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CourseCardProps {
  title: string;
  instructor: string;
  price: string;
  rating: number;
  students: string;
  duration: string;
  image: string;
  category: string;
  level?: string;
}

export function CourseCard({
  title,
  instructor,
  price,
  rating,
  students,
  duration,
  image,
  category,
  level = "Beginner",
}: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-xl group"
    >
      <div className="relative overflow-hidden aspect-video">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
          {category}
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium">
          {level}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">{instructor}</p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{students}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-semibold">{rating}</span>
            <span className="text-sm text-muted-foreground">(4.8K)</span>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {price}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
