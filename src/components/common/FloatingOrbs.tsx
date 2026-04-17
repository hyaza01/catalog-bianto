interface FloatingOrbsProps {
  className?: string
}

export const FloatingOrbs = ({ className }: FloatingOrbsProps) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
    <div
      className="animate-float-slow absolute -left-16 -top-16 h-[28rem] w-[28rem] rounded-full bg-brand-primary/35 blur-[110px]"
      style={{ animationDelay: '0s' }}
    />
    <div
      className="animate-float-medium absolute right-[-8%] top-[10%] h-80 w-80 rounded-full bg-brand-accent/30 blur-[90px]"
      style={{ animationDelay: '-6s' }}
    />
    <div
      className="animate-float-fast absolute bottom-[-10%] left-[30%] h-72 w-72 rounded-full bg-brand-primary/25 blur-[80px]"
      style={{ animationDelay: '-11s' }}
    />
    <div
      className="animate-float-slow absolute right-[10%] bottom-[15%] h-56 w-56 rounded-full bg-brand-accent/20 blur-[70px]"
      style={{ animationDelay: '-4s' }}
    />
  </div>
)
