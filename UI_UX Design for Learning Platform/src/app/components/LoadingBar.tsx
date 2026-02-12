import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function LoadingBar() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (navigation.state === "loading") {
      setProgress(20);
      const timer1 = setTimeout(() => setProgress(50), 100);
      const timer2 = setTimeout(() => setProgress(80), 200);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);

  return (
    <AnimatePresence>
      {progress > 0 && progress < 100 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress / 100 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent z-[100] origin-left"
        />
      )}
    </AnimatePresence>
  );
}
