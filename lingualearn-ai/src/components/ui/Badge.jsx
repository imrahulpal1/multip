import clsx from 'clsx'

export default function Badge({ children, className }) {
  return (
    <span
      className={clsx(
        'rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100',
        className,
      )}
    >
      {children}
    </span>
  )
}
