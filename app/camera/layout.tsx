import React from 'react'

export default function CameraPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<section data-layout="camera">
    {children}
  </section>)
}
