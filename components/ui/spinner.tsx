"use client"

import dynamic from 'next/dynamic'

import { cn } from '@/lib/utils'

const Loader2Icon = dynamic(() => import('lucide-react').then((m) => m.Loader2Icon), { ssr: false })

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
