'use client'
import Image, { StaticImageData } from 'next/image'

interface IconTileProps {
  icon: StaticImageData,
  text: string
}

export const IconTile = ({
  icon,
  text
}: IconTileProps) => {
  return (
    <div role="button" className="rounded-xl w-40 h-40 bg-zinc-700 flex flex-col justify-center items-center cursor-pointer transition border-none hover:border-2 hover:border-lime-300 hover:border-solid">
      <Image src={icon} alt="Camera" className='mb-2' />

      <span>{text}</span>
    </div>
  )
}
