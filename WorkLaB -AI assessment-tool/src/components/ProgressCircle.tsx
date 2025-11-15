interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 12,
  label = "Progress belajar",
  className = ""
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getProgressLevel = (pct: number): string => {
    if (pct >= 80) return "Excellent";
    if (pct >= 60) return "Good";
    if (pct >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
        <div className="text-4xl font-bold text-primary">{percentage}%</div>
        <div className="text-sm text-muted-foreground mt-1">{getProgressLevel(percentage)}</div>
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          className="transform -rotate-90"
          width={size} 
          height={size}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
