import Image from 'next/image'
import Camera from '../public/cam_square.svg'
import Video from '../public/Video.svg'
import { Button } from '@/components/Button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-10 py-20">
      <div className="text-center">
        <h2 className="text-3xl mb-2 font-bold"> Welcome! </h2>
        <span className="font-semibold"> What do you want to use this device for? </span>
      </div>
      <div className="rounded-xl w-40 h-40 bg-zinc-700 flex flex-col justify-center items-center cursor-pointer transition border-none hover:border-2 hover:border-lime-300 hover:border-solid hover:text-lime-300">
        <Image src={Camera} alt="Camera" className='mb-2'/>

        <span> Use As Camera </span>
      </div>

      <div className="rounded-xl w-40 h-40 bg-zinc-700 flex flex-col justify-center items-center cursor-pointer transition hover:border-2 hover:border-lime-300 hover:border-solid hover:text-lime-300">
        <Image src={Video} alt="Video" className="mb-2" />
        <span> See Recordings </span>
      </div>

      <div className="flex flex-row">
        <Button> Log In </Button>
        <Button> Sign Up </Button>
      </div>
    </main>
  )
}
