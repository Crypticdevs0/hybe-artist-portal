"use client"

import dynamic from "next/dynamic"
const Check = dynamic(() => import("lucide-react").then((m) => m.Check), { ssr: false })
const X = dynamic(() => import("lucide-react").then((m) => m.X), { ssr: false })
import { useEffect, useState } from "react"

interface PasswordRequirement {
  id: string
  label: string
  validator: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    validator: (pwd) => pwd.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    validator: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    validator: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: "number",
    label: "One number",
    validator: (pwd) => /\d/.test(pwd),
  },
  {
    id: "special",
    label: "One special character",
    validator: (pwd) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
  },
]

interface PasswordRequirementsProps {
  password: string
  onValidityChange?: (isValid: boolean) => void
}

export function PasswordRequirements({ password, onValidityChange }: PasswordRequirementsProps) {
  const [validRequirements, setValidRequirements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const valid = new Set<string>()
    requirements.forEach((req) => {
      if (req.validator(password)) {
        valid.add(req.id)
      }
    })
    setValidRequirements(valid)

    const allValid = valid.size === requirements.length
    onValidityChange?.(allValid)
  }, [password, onValidityChange])

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Password must contain:</p>
      <ul className="space-y-1.5">
        {requirements.map((req) => {
          const isValid = validRequirements.has(req.id)
          return (
            <li key={req.id} className="flex items-center gap-2 text-sm">
              {isValid ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
              <span className={isValid ? "text-green-600" : "text-muted-foreground"}>{req.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
