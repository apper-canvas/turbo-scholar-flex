import { motion } from "framer-motion";

const GradeCircle = ({ 
  percentage, 
  size = "medium", 
  showLabel = true,
  className = ""
}) => {
  const sizes = {
    small: { width: 60, height: 60, strokeWidth: 4, fontSize: "text-sm" },
    medium: { width: 80, height: 80, strokeWidth: 6, fontSize: "text-base" },
    large: { width: 120, height: 120, strokeWidth: 8, fontSize: "text-xl" }
  };

  const { width, height, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getGradeColor = (grade) => {
    if (grade >= 90) return "#10B981"; // Green
    if (grade >= 80) return "#3B82F6"; // Blue  
    if (grade >= 70) return "#F59E0B"; // Amber
    if (grade >= 60) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  };

  const color = getGradeColor(percentage);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize}`} style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default GradeCircle;