import { motion } from 'framer-motion';

interface Props {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export default function ProgressBar({ value, size = 'md', className = '' }: Props) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full rounded-full overflow-hidden ${heights[size]} bg-app-input ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}
