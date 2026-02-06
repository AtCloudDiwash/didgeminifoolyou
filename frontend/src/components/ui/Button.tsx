import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, type HTMLMotionProps } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

// Combine Framer Motion props with Button props
type MotionButtonProps = ButtonProps & HTMLMotionProps<"button">;

const Button = forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {

        const variants = {
            primary: 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-[0_0_15px_rgba(45,122,243,0.5)]',
            danger: 'bg-brand-red hover:bg-brand-red-dark text-white shadow-[0_0_15px_rgba(221,31,5,0.5)]',
            outline: 'border-2 border-white/20 hover:bg-white/10 text-white',
            ghost: 'hover:bg-white/10 text-white',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg font-bold',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    'rounded-full font-heading transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button, cn };
