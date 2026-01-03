// src/components/ui/AppIcon.tsx
'use client';

import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

type IconVariant = 'outline' | 'solid';
interface AppIconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    variant?: IconVariant;
    size?: number;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

const AppIcon = React.forwardRef<SVGSVGElement, AppIconProps>(({
    name,
    variant = 'outline',
    size = 24,
    className = '',
    onClick,
    disabled = false,
    ...props
}, ref) => {
    const iconSet = variant === 'solid' ? HeroIconsSolid : HeroIcons;
    const IconComponent = iconSet[name as keyof typeof iconSet] as React.ComponentType<any>;

    if (!IconComponent) {
        const { ref: _, ...restProps } = props;
        return (
            <QuestionMarkCircleIcon
                ref={ref}
                width={size}
                height={size}
                className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
                onClick={disabled ? undefined : onClick}
                {...restProps}
            />
        );
    }

    const { ref: _, ...restProps } = props;
    return (
        <IconComponent
            ref={ref}
            width={size}
            height={size}
            className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
            onClick={disabled ? undefined : onClick}
            {...restProps}
        />
    );
});

AppIcon.displayName = 'AppIcon';

export default AppIcon;