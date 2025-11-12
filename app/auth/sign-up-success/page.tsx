import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/ui/icon"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 sm:p-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-4 sm:mb-6">
          <Icon name="Sparkles" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            HYBE
          </h1>
        </div>
        <Card className="border-primary/10 shadow-xl">
          <CardHeader className="space-y-2 sm:space-y-3 pb-6">
            <CardTitle className="text-2xl sm:text-3xl">Account Created!</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Please check your email to confirm your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once you've confirmed your email, you can sign in to your account.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-block w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
