import clsx from 'clsx'

export default function Card({ title, subtitle, children, className }) {
  return (
    <section
      className={clsx(
        'animate-slide-in rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl shadow-glass',
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
