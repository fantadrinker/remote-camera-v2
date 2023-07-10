'use server'

import { cookies } from "next/dist/client/components/headers"

export const getUserName = () => {
  const allCookies = cookies()
  const username = allCookies.get("username")?.value
  return username
}

// the url from this doesn't work, maybe try getting username from cookies and 
// passing it to the storage api on client side
export const getUploadUrl = async () => {
  try {
    const allCookies = cookies()
    const username = allCookies.get("username")?.value
    const response = await fetch(`${process.env.STORAGE_API}access-url?sub=${username}`)
    const { uploadUrl } = await response.json()
    return uploadUrl
  } catch (error) {
    console.error(error)
  }
}


