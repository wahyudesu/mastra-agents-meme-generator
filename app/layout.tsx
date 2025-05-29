import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mastra Workshop - AI-Powered Meme Generator',
  description: 'Workshop demonstrating Mastra agents and tools for turning workplace frustrations into memes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 