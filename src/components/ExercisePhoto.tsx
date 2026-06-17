import { useState } from 'react'
import { Dumbbell } from 'lucide-react'

interface Props {
  img: string | null
  alt: string
}

// Demonstration photo that fills its container, with a clean charcoal fallback.
export default function ExercisePhoto({ img, alt }: Props) {
  const [errored, setErrored] = useState(false)

  if (!img || errored) {
    return (
      <div className="w-full h-full min-h-[118px] bg-[#1C1C1E] flex items-center justify-center">
        <Dumbbell size={32} className="text-white/70" />
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[118px] bg-[#1C1C1E] overflow-hidden">
      <img
        src={img}
        alt={alt}
        loading="lazy"
        onError={() => setErrored(true)}
        className="w-full h-full object-cover grayscale contrast-110"
      />
    </div>
  )
}
