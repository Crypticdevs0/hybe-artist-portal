'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoadingSpinner() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)

    const originalPush = router.push
    const originalReplace = router.replace

    router.push = function (...args) {
      handleStart()
      return originalPush.apply(router, args)
    }

    router.replace = function (...args) {
      handleStart()
      return originalReplace.apply(router, args)
    }

    // Handle regular navigation links
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement | null

      if (
        link &&
        link.href &&
        link.target !== '_blank' &&
        !link.hasAttribute('download') &&
        !link.getAttribute('href')?.startsWith('#')
      ) {
        const isSameOrigin = link.origin === window.location.origin
        if (isSameOrigin) {
          handleStart()
        }
      }
    }

    document.addEventListener('click', handleClick)

    // Stop loading after page becomes interactive
    const timer = setTimeout(() => setIsLoading(false), 3000)

    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(timer)
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [router])

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary/50 shadow-lg shadow-primary/50"></div>
              <div className="absolute inset-2 animate-pulse rounded-full border-2 border-primary/20"></div>
            </div>
            <p className="text-center text-sm font-medium text-foreground">
              Loading your experience...
            </p>
          </div>
        </div>
      )}
    </>
  )
}
