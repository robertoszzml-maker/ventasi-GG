import React from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
);

export { Button };
