import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Users, Star, Shield, Sparkles, Heart, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 bg-[url('/abstract-musical-notes-pattern.jpg')] opacity-5 bg-cover bg-center" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-primary">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Premium Artist Connection Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-4 sm:mb-6">
              HYBE
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-muted-foreground mb-6 sm:mb-8">
              Artist Communication Portal
            </p>
            <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground px-4 sm:px-0 text-balance">
              Connect directly with your favorite artists. Get exclusive content, send personal messages, and be part of
              an intimate community where every interaction matters.
            </p>

            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gradient-hybe text-white hover:opacity-90 transition-opacity"
              >
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Premium Member Benefits
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0 text-balance">
            Experience a new level of connection with your favorite artists
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
            <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
              <div className="mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold">Direct Messaging</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Send private messages directly to artists and get responses
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
            <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
              <div className="mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all">
                <Star className="h-7 w-7 sm:h-8 sm:w-8 text-accent-foreground" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold">Exclusive Content</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Access behind-the-scenes content and early announcements
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
            <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
              <div className="mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-2/20 to-chart-2/10 group-hover:from-chart-2/30 group-hover:to-chart-2/20 transition-all">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-chart-2" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold">Community</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Join a vibrant community of fans and interact on posts
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
            <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
              <div className="mb-4 sm:mb-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 group-hover:from-chart-3/30 group-hover:to-chart-3/20 transition-all">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-chart-3" />
              </div>
              <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold">Secure Platform</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Your privacy and security are our top priorities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-gradient-to-br from-secondary/30 via-background to-accent/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">50K+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Premium Members</div>
            </div>
            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">200+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Artists Connected</div>
            </div>
            <div className="text-center">
              <div className="mb-3 sm:mb-4 inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">1M+</div>
              <div className="text-sm sm:text-base text-muted-foreground">Messages Exchanged</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="rounded-2xl sm:rounded-3xl gradient-hybe px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/musical-waves-pattern.jpg')] opacity-10 bg-cover bg-center" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 text-balance">
              Ready to Connect?
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-white/90 px-4 sm:px-0 text-balance leading-relaxed">
              Join thousands of members who are already experiencing exclusive access to their favorite HYBE artists.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90"
              >
                <Link href="/auth/sign-up">Create Your Account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/dashboard">Explore Feed</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4">HYBE</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">Artist Communication Portal</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Support
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
              © 2025 HYBE Corporation. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
