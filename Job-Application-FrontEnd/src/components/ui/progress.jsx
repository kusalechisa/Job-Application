import * as React from "react"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className || ''}`}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-sky-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
