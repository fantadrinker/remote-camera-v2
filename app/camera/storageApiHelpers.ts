import { cookies } from "next/dist/client/components/headers";

export const getUploadUrlClient = async (username: string, data: Blob) => {
  console.log('uploadvideo', data)
  try {
    const response = await fetch(`${process.env.STORAGE_API}access-url?sub=${username}`)
    const { uploadUrl } = await response.json()
    return uploadUrl;
  } catch (error) {
    console.error(error)
  }
}

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
