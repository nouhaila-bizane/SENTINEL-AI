import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenancePageProps {
  message?: string;
}

export default function MaintenancePage({ message }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-sentinel-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sentinel-cyan/10 rounded-full blur-[120px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg glass-panel rounded-2xl p-8 border border-sentinel-border text-center"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sentinel-card border border-sentinel-border flex items-center justify-center">
          <AlertTriangle className="text-sentinel-warning" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">System Under Maintenance</h1>
        <p className="text-sentinel-muted mb-6">
          {message || 'SENTINEL AI is currently undergoing scheduled maintenance to improve security and performance.'}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-sentinel-cyan bg-sentinel-cyan/10 py-2 px-4 rounded-full inline-flex mx-auto">
          <Loader2 className="animate-spin" size={14} />
          <span>We will be back shortly</span>
        </div>

        <div className="mt-8 pt-6 border-t border-sentinel-border flex items-center justify-center gap-2 text-sentinel-muted text-sm">
          <ShieldCheck size={16} />
          <span>SENTINEL AI Security Operations</span>
        </div>
      </motion.div>
    </div>
  );
}