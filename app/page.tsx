'use client'
import Camera from '../public/cam_square.svg'
import Video from '../public/Video.svg'
import { Button } from '@/components/Button'
import { IconTile } from '@/components/IconTile'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-10 py-20">
      <div className="text-center">
        <h2 className="text-3xl mb-2 font-bold"> Welcome! </h2>
        <span className="font-semibold"> What do you want to use this device for? </span>
      </div>
      <Link href="/camera">
        <IconTile icon={Camera} text="Use As Camera" />
      </Link>
      <Link href="/recordings">
        <IconTile icon={Video} text="See Recordings" />
      </Link>

      <div className="flex flex-row">
        <Button> Log In </Button>
        <Button> Sign Up </Button>
      </div>
    </main>
  )
}
