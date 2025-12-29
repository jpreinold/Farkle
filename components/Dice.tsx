// components/Dice.tsx
import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from './ThemeContext';

interface DiceProps {
  value: number; // 1-6
  isRolling: boolean;
  isSelected: boolean;
  isBanked: boolean;
  onClick?: () => void;
  isSelectable?: boolean;
}

const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  isSelected,
  isBanked,
  onClick,
  isSelectable = true,
}) => {
  const { theme } = useContext(ThemeContext);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  // Animation variants for rolling
  const rollingVariants = {
    rolling: {
      rotateX: [0, 360, 720, 1080],
      rotateY: [0, 360, 720, 1080],
      rotateZ: [0, 180, 360, 540],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    settled: {
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  // Render dice face dots based on value
  const renderDiceFace = () => {
    const size = 48;
    const dotSize = 8;
    const spacing = 16;

    // Position patterns for each face value
    const patterns: Record<number, Array<{ x: number; y: number }>> = {
      1: [{ x: size / 2, y: size / 2 }],
      2: [
        { x: size / 2 - spacing, y: size / 2 - spacing },
        { x: size / 2 + spacing, y: size / 2 + spacing },
      ],
      3: [
        { x: size / 2 - spacing, y: size / 2 - spacing },
        { x: size / 2, y: size / 2 },
        { x: size / 2 + spacing, y: size / 2 + spacing },
      ],
      4: [
        { x: size / 2 - spacing, y: size / 2 - spacing },
        { x: size / 2 + spacing, y: size / 2 - spacing },
        { x: size / 2 - spacing, y: size / 2 + spacing },
        { x: size / 2 + spacing, y: size / 2 + spacing },
      ],
      5: [
        { x: size / 2 - spacing, y: size / 2 - spacing },
        { x: size / 2 + spacing, y: size / 2 - spacing },
        { x: size / 2, y: size / 2 },
        { x: size / 2 - spacing, y: size / 2 + spacing },
        { x: size / 2 + spacing, y: size / 2 + spacing },
      ],
      6: [
        { x: size / 2 - spacing, y: size / 2 - spacing },
        { x: size / 2 + spacing, y: size / 2 - spacing },
        { x: size / 2 - spacing, y: size / 2 },
        { x: size / 2 + spacing, y: size / 2 },
        { x: size / 2 - spacing, y: size / 2 + spacing },
        { x: size / 2 + spacing, y: size / 2 + spacing },
      ],
    };

    const validValue = Math.max(1, Math.min(6, displayValue)) || 1;
    const dots = patterns[validValue] || patterns[1];

    return (
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: 'block' }}
      >
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dotSize / 2}
            fill={theme.text}
            opacity={0.9}
          />
        ))}
      </svg>
    );
  };

  const clickable = onClick && !isBanked && isSelectable;

  // Determine dice background and border colors
  const getDiceStyle = (): React.CSSProperties => {

    const baseStyle: React.CSSProperties = {
      width: '64px',
      height: '64px',
      backgroundColor: theme.cardBackground,
      borderWidth: '3px',
      borderStyle: 'solid',
      borderColor: theme.borderColor,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: clickable ? 'pointer' : 'default',
      boxShadow: `0 4px 8px ${theme.shadowColor}`,
      transition: 'all 0.2s ease',
      perspective: '1000px',
      opacity: isSelectable ? 1 : 0.4,
    };

    if (isBanked) {
      baseStyle.opacity = 0.6;
      baseStyle.backgroundColor = theme.tableRowBorder;
      baseStyle.borderColor = theme.secondary;
      baseStyle.transform = 'scale(0.95)';
    } else if (isSelected) {
      baseStyle.borderColor = theme.secondary;
      baseStyle.boxShadow = `0 0 0 3px ${theme.secondary}40, 0 4px 8px ${theme.shadowColor}`;
      baseStyle.transform = 'scale(1.05)';
    }

    return baseStyle;
  };

  return (
    <motion.div
      style={getDiceStyle()}
      animate={isRolling ? 'rolling' : 'settled'}
      variants={rollingVariants}
      onClick={clickable ? onClick : undefined}
      whileHover={clickable && !isRolling ? { scale: 1.1 } : {}}
      whileTap={clickable && !isRolling ? { scale: 0.95 } : {}}
      aria-label={`Dice showing ${value}${isSelected ? ', selected' : ''}${isBanked ? ', banked' : ''}`}
      role="button"
      tabIndex={clickable ? 0 : -1}
      aria-disabled={!clickable}
      onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {renderDiceFace()}
    </motion.div>
  );
};

export default Dice;

