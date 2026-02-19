import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

interface CategoryCardProps {
  name: string;
  count: number;
  icon: LucideIcon;
  delay?: number;
}

export function CategoryCard({ name, count, icon: Icon, delay = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Link
        to="/courses"
        className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-all">
            <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{count} courses</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
