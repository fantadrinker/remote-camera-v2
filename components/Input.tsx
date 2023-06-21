
export enum InputSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize: InputSize
}

const INPUT_SIZE_MAP = Object.freeze({
  [InputSize.Small]: 'w-14',
  [InputSize.Medium]: 'w-24',
  [InputSize.Large]: 'w-52',
})

export const Input = ({ inputSize, className, ...props }: InputProps) => {
  
  return (<input className={`${className || ''} rounded-md bg-neutral-600 px-2 py-1 ${INPUT_SIZE_MAP[inputSize]} text-right`} {...props} />)
}
