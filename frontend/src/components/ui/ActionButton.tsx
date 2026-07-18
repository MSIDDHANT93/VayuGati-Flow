import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

interface ActionButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-mission-accent text-mission-black hover:bg-mission-accent/90 border-transparent',
  secondary: 'bg-mission-info text-mission-black hover:bg-mission-info/90 border-transparent',
  outline: 'bg-transparent text-mission-accent border-mission-accent hover:bg-mission-accent/10',
  danger: 'bg-transparent text-mission-danger border-mission-danger hover:bg-mission-danger/10',
  ghost: 'bg-transparent text-gray-300 border-mission-border hover:bg-mission-border/30',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded border font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export default ActionButton
