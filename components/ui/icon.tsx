"use client"

import React, { useEffect, useState } from "react"

type IconProps = React.ComponentPropsWithoutRef<'svg'> & {
  name: string
}

export default function Icon({ name, ...props }: IconProps) {
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    let mounted = true
    import("lucide-react")
      .then((mod) => {
        if (!mounted) return
        const C = (mod as any)[name]
        if (C) setComp(() => C)
      })
      .catch(() => {
        /* swallow */
      })

    return () => {
      mounted = false
    }
  }, [name])

  if (!Comp) {
    // lightweight fallback: empty svg to avoid layout shift
    return <svg aria-hidden className={props.className} width="1" height="1" />
  }

  return <Comp {...props} />
}
