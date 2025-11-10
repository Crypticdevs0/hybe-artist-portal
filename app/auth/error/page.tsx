import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Icon from "@/components/ui/icon"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Icon name="AlertCircle" className="h-8 w-8 text-red-600" />
              </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">An error occurred during authentication.</p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
