import React from 'react'

export default function RecordingsPageLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <section data-layout="recordings">{children}</section>
  )
}
