import clsx from 'clsx'

export default function Card({ title, subtitle, children, className, action }) {
  return (
    <section
      className={clsx(
        'animate-slide-in rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-glass',
        className,
      )}
    >
      {(title || subtitle || action) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
