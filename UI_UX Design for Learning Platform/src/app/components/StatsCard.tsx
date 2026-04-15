import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export function StatsCard({ icon: Icon, value, label, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors group"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
      </div>
      <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </motion.div>
  );
}
