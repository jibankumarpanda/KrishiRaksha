// src/components/ui/AppIcon.d.ts
import { ComponentType, SVGProps } from 'react';

export interface AppIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  variant?: 'outline' | 'solid';
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

declare const AppIcon: React.FC<AppIconProps>;
export default AppIcon;