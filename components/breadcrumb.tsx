"use client"

import Link from "next/link"
import dynamic from "next/dynamic"

const ChevronRight = dynamic(() => import("lucide-react").then((m) => m.ChevronRight), { ssr: false })

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1 text-sm text-muted-foreground mb-6 ${className}`} aria-label="breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
