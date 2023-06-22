'use server'

import { cookies } from "next/dist/client/components/headers"

export const uploadVideo = (data: Blob) => {
  const allCookies = cookies()
  const username = allCookies.get("username")?.value
  return `username is ${username} and data size is ${data.size}`
}
