"use client"

import Link from "next/link"
import { Github } from "lucide-react"
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch"
import { usePathname } from "next/navigation"
import Logo from "@/app/components/Logo"

export default function Header() {
  const pathname = usePathname()
  const hide = pathname?.startsWith('/play') || pathname?.startsWith('/share')
  if (hide) return null
  return (
    <>
      <Link href="/" className="fixed top-0 left-0 m-4 z-50" aria-label="Moodify home">
        <Logo size={36} />
      </Link>
      <header className="fixed top-0 right-0 m-4 z-50 flex items-center space-x-4">
        <Link
          href="https://github.com/OriginalByteMe"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="w-6 h-6 text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
        </Link>
        <Link
          href="https://blog.noahrijkaard.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors">
            Blog
          </div>
        </Link>
        <ThemeSwitch />
      </header>
    </>
  )
}
