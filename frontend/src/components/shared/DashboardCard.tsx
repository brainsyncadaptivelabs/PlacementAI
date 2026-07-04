"use client";

import React from "react";
import { motion } from "framer-motion";

export interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, className }) => {
  return (
    <motion.div
      className={`bg-[#1a1e25] rounded-xl border border-border/20 p-4 shadow-lg backdrop-blur-sm ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};
