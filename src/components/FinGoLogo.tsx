import React from 'react';

type FinGoLogoProps = React.SVGProps<SVGSVGElement>;

const FinGoLogo: React.FC<FinGoLogoProps> = ({
  width = 20,
  height = 20,
  ...props
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="4" y="14" width="4" height="6" rx="1" fill="white" />
    <rect x="10" y="10" width="4" height="10" rx="1" fill="white" />
    <rect x="16" y="4" width="4" height="16" rx="1" fill="white" />
    <path
      d="M6 12L12 8L18 3"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
    <path
      d="M15 3H18V6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

export default FinGoLogo;
export { FinGoLogo };
