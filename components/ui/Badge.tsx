import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'warning' | 'info' | 'success' | 'destructive'
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-forest-green text-white hover:bg-forest-green-700",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        outline: "border-forest-green text-forest-green",
        warning: "border-transparent bg-vibrant-gold text-white hover:bg-forest-green-700",
        info: "border-transparent bg-vibrant-gold-100 text-forest-green hover:bg-vibrant-gold-200",
        success: "border-transparent bg-green-100 text-green-800",
        destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200"
    }

    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variants[variant],
            className
        )} {...props} />
    )
}

export { Badge }
