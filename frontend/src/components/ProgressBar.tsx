interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar = ({
  value,
  max = 100,
  color = '#6366f1',
  showLabel = true,
  size = 'md',
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};
