// components/CustomButton.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties | string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  disabled, 
  style,
  variant = 'primary'
}) => {
  const { theme } = useContext(ThemeContext);
  
  const baseClasses = "relative py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform";
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "hover:scale-105 hover:shadow-lg active:scale-95 cursor-pointer";
  
  const variantClasses = {
    primary: "",
    secondary: "",
    outline: "bg-transparent border-2"
  };
  
  const getButtonStyle = (): React.CSSProperties => {
    if (disabled) {
      return {
        backgroundColor: '#A9CCE3',
        ...(typeof style === 'object' ? style : {}),
      };
    }
    
    if (variant === 'outline') {
      return {
        borderColor: theme.secondary,
        color: theme.secondary,
        ...(typeof style === 'object' ? style : {}),
      };
    }
    
    // Create gradient effect for primary buttons
    const gradient = `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`;
    
    return {
      background: gradient,
      boxShadow: `0 4px 14px 0 ${theme.shadowColor}`,
      ...(typeof style === 'object' ? style : {}),
    };
  };

  return (
    <button
      className={`${baseClasses} ${disabledClasses} ${variantClasses[variant]}`}
      style={getButtonStyle()}
      onClick={onPress}
      disabled={disabled}
    >
      <span className="relative z-10 text-base font-semibold">{title}</span>
      {!disabled && variant === 'primary' && (
        <span 
          className="absolute inset-0 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-200"
          style={{ backgroundColor: '#ffffff' }}
        />
      )}
    </button>
  );
};

export default CustomButton;
