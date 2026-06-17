import React, { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number       // ms offset for staggering siblings
  className?: string
  as?: keyof React.JSX.IntrinsicElements
}

// Wraps any element and reveals it when it scrolls into the viewport.
// Use `delay` to stagger a list: delay={index * 40}
export default function ScrollReveal({ children, delay = 0, className = '', as: Tag = 'div' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If it's already in view on mount (e.g. first few items), reveal immediately.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => el.classList.add('is-visible'), delay)
          observer.unobserve(el)
          return () => clearTimeout(timer)
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </Tag>
  )
}
