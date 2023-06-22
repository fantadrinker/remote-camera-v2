
export enum ButtonSize {
  Default = 'default',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  danger?: boolean
  confirm?: boolean
}

const BUTTON_SIZE_MAP = Object.freeze({
  [ButtonSize.Default]: '',
  [ButtonSize.Small]: '',
  [ButtonSize.Medium]: 'w-24',
  [ButtonSize.Large]: 'w-36',
})


export const Button = ({ children, size = ButtonSize.Default, danger, confirm, ...props }: ButtonProps) => {

  return (
    <button
      className={`m-2 ${BUTTON_SIZE_MAP[size]} rounded-md ${danger ? 'bg-red-950' : (confirm ? 'bg-green-950' : 'bg-neutral-900')} px-4 py-2 transition hover:border hover:border-lime-300 hover:boder-solid hover:text-lime-300`}
      {...props}
    >
      {children}
    </button>
  )
}
