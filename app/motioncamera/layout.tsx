import React from 'react'

export default function MotionCameraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<section data-layout="motion-camera">
    {children}
  </section>)
}
