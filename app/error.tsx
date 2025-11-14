"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import Link from "next/link"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-500/10 via-background to-red-500/5 p-4 sm:p-6">
      <Card className="w-full max-w-lg text-center border-destructive/20 shadow-xl">
        <CardContent className="p-8 sm:p-12">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6 sm:mb-8">
            <Icon name="AlertTriangle" className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-destructive mb-3 sm:mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Please try again later. If the problem persists, contact support.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="text-left bg-muted/50 p-4 rounded-lg text-xs text-muted-foreground overflow-auto max-h-40 mb-6">
              <p className="font-semibold">Error Details:</p>
              <pre className="whitespace-pre-wrap">{error.message}</pre>
              {error.digest && <p>Digest: {error.digest}</p>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button onClick={reset} variant="destructive" className="w-full sm:w-auto">
              <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/">
                <Icon name="Home" className="mr-2 h-4 w-4" /> Go to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
