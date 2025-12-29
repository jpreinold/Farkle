// components/CustomButton.tsx
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

interface CustomButtonProps {
  title: string;
  onPress: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties | string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, disabled, style }) => {
  const { theme } = useContext(ThemeContext);
  
  const baseClasses = "py-3 px-5 rounded-lg items-center mx-1 transition-opacity";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-400" : "";
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: disabled ? '#A9CCE3' : theme.secondary,
    ...(typeof style === 'object' ? style : {}),
  };

  return (
    <button
      className={`${baseClasses} ${disabledClasses}`}
      style={buttonStyle}
      onClick={onPress}
      disabled={disabled}
    >
      <span className="text-base font-semibold text-white">{title}</span>
    </button>
  );
};

export default CustomButton;
