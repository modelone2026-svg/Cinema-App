import React from 'react';
import { Hammer } from 'lucide-react';
import { motion } from 'motion/react';

interface MaintenanceProps {
  message: string;
  onAdminClick: () => void;
}

export default function Maintenance({ message, onAdminClick }: MaintenanceProps) {
  return (
    <div id="maintenance-page" className="min-h-screen bg-[#0c0a0f] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md bg-[#13111c] border border-red-500/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-600"></div>
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full text-red-500 animate-pulse">
            <Hammer size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-4">الموقع في وضع الصيانة</h1>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          {message || "نحن نقوم ببعض التحديثات والتحسينات لتقديم تجربة أفضل لكم. سنعود قريباً جداً!"}
        </p>

        <div className="border-t border-white/5 pt-6 flex flex-col items-center gap-3">
          <span className="text-xs text-gray-500">نشكر تفهمكم وصبركم</span>
          
          <button
            id="admin-login-bypass"
            onClick={onAdminClick}
            className="text-xs text-gray-600 hover:text-red-400 transition-colors mt-2"
          >
            دخول الإدارة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
