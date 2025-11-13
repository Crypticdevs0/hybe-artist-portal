"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
// Dynamically import icons to keep them out of the initial client bundle
const Bell = dynamic(() => import("lucide-react").then((mod) => mod.Bell), { ssr: false })
const Home = dynamic(() => import("lucide-react").then((mod) => mod.Home), { ssr: false })
const MessageSquare = dynamic(() => import("lucide-react").then((mod) => mod.MessageSquare), { ssr: false })
const User = dynamic(() => import("lucide-react").then((mod) => mod.User), { ssr: false })
const LogOut = dynamic(() => import("lucide-react").then((mod) => mod.LogOut), { ssr: false })
const Menu = dynamic(() => import("lucide-react").then((mod) => mod.Menu), { ssr: false })
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import useSupabaseBrowserClient from "@/lib/supabase/client"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SearchBar } from "@/components/search-bar"

interface DashboardNavProps {
  userRole?: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = useSupabaseBrowserClient()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Feed" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link
              href="/dashboard"
              className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex-shrink-0"
            >
              HYBE
            </Link>
            <div className="hidden lg:flex lg:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={isActive ? "gradient-hybe text-white" : "hover:bg-primary/5"}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden lg:inline">{item.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 hidden md:block max-w-sm lg:max-w-md">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center gap-2">
            {userRole === "admin" && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5 bg-transparent"
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              disabled={isLoggingOut}
              className="hover:bg-primary/5"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <div className="pb-4 border-b">
                  <SearchBar />
                </div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={isActive ? "default" : "ghost"}
                    className={`justify-start ${isActive ? "gradient-hybe text-white" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}

                <div className="border-t pt-4 mt-4 space-y-2">
                  {userRole === "admin" && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/admin">Admin Panel</Link>
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    variant="ghost"
                    className="w-full justify-start"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
