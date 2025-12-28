import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface IconButtonProps extends ButtonProps {
    tooltip: string;
    tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
    children: React.ReactNode;
}

/**
 * Accessible icon button with tooltip.
 * Use this for all icon-only buttons to ensure they have proper labels.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ tooltip, tooltipSide = 'top', children, ...props }, ref) => {
        return (
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button ref={ref} aria-label={tooltip} {...props}>
                            {children}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side={tooltipSide}>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
);

IconButton.displayName = 'IconButton';

export default IconButton;
