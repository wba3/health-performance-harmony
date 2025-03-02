
import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface DashboardCardProps extends HTMLMotionProps<"div"> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon,
  isLoading = false,
  className,
  headerAction,
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden",
        isLoading && "animate-pulse",
        className
      )}
      {...props}
    >
      <div className="px-6 py-5 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

export default DashboardCard;
