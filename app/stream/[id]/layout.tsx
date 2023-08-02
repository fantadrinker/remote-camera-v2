import React from 'react'

export default function StreamPage({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section data-layout="stream">
      {children}
    </section>
  )
}
