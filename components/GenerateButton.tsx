
import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface GenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = isLoading || props.disabled;

  return (
    <button
      className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white rounded-lg shadow-lg group transition-all duration-300 ease-in-out transform hover:scale-105 ${
        isDisabled ? 'cursor-not-allowed bg-slate-400 dark:bg-slate-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:shadow-xl'
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {/* Background shine effect */}
      {!isDisabled && (
         <span className="absolute top-0 right-full w-full h-full bg-gradient-to-r from-white/20 to-transparent opacity-50 transform transition-all duration-500 ease-out group-hover:translate-x-full group-hover:duration-700"></span>
      )}
      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <SpinnerIcon className="w-5 h-5" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            {children || (
              <>
                <SparklesIcon className="w-5 h-5" />
                <span>Generate</span>
              </>
            )}
          </>
        )}
      </span>
    </button>
  );
};

export default GenerateButton;
