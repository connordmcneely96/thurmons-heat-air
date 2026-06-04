import { cn } from '@/lib/utils'

interface StatsCardProps {
    label: string
    value: string | number
    icon?: string
    trend?: string
    variant?: 'default' | 'warning' | 'success' | 'info'
    onClick?: () => void
}

const VARIANT_STYLES = {
    default: 'border-gray-700',
    warning: 'border-yellow-600/40 bg-yellow-500/10',
    success: 'border-forest-green-600/40 bg-vibrant-gold-500/10',
    info: 'border-ocean-blue/40 bg-ocean-blue/10',
}

const ICON_BG = {
    default: 'bg-gray-700 text-gray-300',
    warning: 'bg-yellow-500/20 text-yellow-400',
    success: 'bg-vibrant-gold-500/20 text-vibrant-gold',
    info: 'bg-ocean-blue/20 text-ocean-blue',
}

export function StatsCard({ label, value, icon, trend, variant = 'default', onClick }: StatsCardProps) {
    const Wrapper = onClick ? 'button' : 'div'
    return (
        <Wrapper
            onClick={onClick}
            className={cn(
                'bg-gray-900 rounded-xl border p-5 text-left transition-shadow',
                VARIANT_STYLES[variant],
                onClick && 'hover:shadow-lg hover:shadow-black/20 cursor-pointer'
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
                </div>
                {icon && (
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', ICON_BG[variant])}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                        </svg>
                    </div>
                )}
            </div>
        </Wrapper>
    )
}
