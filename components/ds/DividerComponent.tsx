"use client";
interface DividerProps {
  margin?: 'small' | 'medium' | 'large';
}

const DividerComponent: React.FC<DividerProps> = ({ margin = 'small' }) => {
  const marginClasses = {
    small: 'my-2',
    medium: 'my-6',
    large: 'my-8',
  };

  return <div className={`bg-border h-[1px] ${marginClasses[margin]}`}></div>;
};

export { DividerComponent };
