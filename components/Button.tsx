
export enum ButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
}

export const Button = ({ children, size, ...props }: ButtonProps) => {
  return (
    <button
      className={`m-2 ${size === ButtonSize.Large? 'w-36': 'w-24'} rounded-md bg-neutral-900 px-4 py-2 transition hover:border hover:border-lime-300 hover:boder-solid hover:text-lime-300`}
      {...props}
    >
      {children}
    </button>
  )
}
