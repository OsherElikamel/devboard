import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  accent?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export default function StatCard({ label, value, icon: Icon, subtitle, accent, onClick, active }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(56,189,248,0.3)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`rounded-2xl p-5 border bg-app-surface backdrop-blur-sm hover:shadow-[0_0_30px_rgba(56,189,248,0.08)] transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${active ? 'border-accent/50 shadow-[0_0_30px_rgba(56,189,248,0.12)]' : 'border-app-border'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-app-text-muted font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${accent ? 'text-accent' : 'text-app-text'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && <p className="text-xs text-app-text-muted mt-1 font-[family-name:var(--font-tech)]">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-accent/10">
          <Icon size={20} className="text-accent" />
        </div>
      </div>
    </motion.div>
  );
}
