import clsx from 'clsx'

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400',
  secondary:
    'bg-slate-800/70 text-slate-100 ring-1 ring-slate-600 hover:bg-slate-700/80',
}

export default function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
