"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, LineChart, Bot } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: "/",
      label: "Data View",
      icon: Database,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: LineChart,
    },
    {
      href: "/ask-ai",
      label: "Ask AI",
      icon: Bot,
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight">Proofpoint SIEM</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
