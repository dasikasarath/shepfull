import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullPage?: boolean
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export default function LoadingSpinner({ size = 'md', label, fullPage }: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-brand-600`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
