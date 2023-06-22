
import Camera from '../public/cam_square.svg'
import Video from '../public/Video.svg'
import { Button, ButtonSize } from '@/components/Button'
import { IconTile } from '@/components/IconTile'
import { cookies } from 'next/dist/client/components/headers'
import Link from 'next/link'

export default function Home() {
  const cookieStore = cookies()
  const username = cookieStore.get('username')?.value

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-10 py-20">
      <div className="text-center">
        <h2 className="text-3xl mb-2 font-bold"> Welcome{username ? `, ${username}` : ''}! </h2>
        <span className="font-semibold"> What do you want to use this device for?</span>
      </div>
      <Link href="/camera">
        <IconTile icon={Camera} text="Use As Camera" />
      </Link>
      <Link href="/recordings">
        <IconTile icon={Video} text="See Recordings" />
      </Link>

      <span className="my-2"> You are not {username}? Try </span>
      <div className="flex flex-row">
        <Button size={ButtonSize.Medium}> Log In </Button>
        <Button size={ButtonSize.Medium}> Sign Up </Button>
      </div>
    </main>
  )
}
