
export const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <select className={`${className} rounded-md bg-neutral-600 px-2 py-1.5 text-right`} {...props} />
  )
}
