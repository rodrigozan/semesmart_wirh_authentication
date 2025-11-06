
import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center p-8 flex flex-col items-center">
      <div className="text-5xl bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-1 max-w-xs">{description}</p>
    </div>
  );
};

export default EmptyState;
