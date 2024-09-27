"use client";
interface TooltipProps {
  message: string;
  position: { x: number; y: number };
}

const FollowingTooltipComponent: React.FC<TooltipProps> = ({
  message,
  position,
}) => {
  return (
    <div
      className="fixed px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg"
      style={{ left: position.x + 10, top: position.y - 30 }}
    >
      {message}
    </div>
  );
};

export { FollowingTooltipComponent };
