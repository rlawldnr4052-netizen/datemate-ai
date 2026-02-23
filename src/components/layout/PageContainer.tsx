import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
  hasNavBar?: boolean
}

export default function PageContainer({ children, className, hasNavBar = true }: PageContainerProps) {
  return (
    <div className={cn(
      'min-h-screen px-5',
      hasNavBar && 'pb-24',
      className,
    )}>
      {children}
    </div>
  )
}
