

export const Button = ({ children, ...props }) => {
  return (
    <button
      className="m-2 w-24 rounded-md bg-neutral-900 px-4 py-2 transition hover:border hover:border-lime-300 hover:boder-solid hover:text-lime-300"
      {...props}
    >
      {children}
    </button>
  )
}
