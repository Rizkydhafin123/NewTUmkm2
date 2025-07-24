"use client" // Tandai sebagai Client Component

import EditUMKMClient from "./EditUMKMClient"

interface EditUMKMPageProps {
  params: {
    id: string
  }
}

export default function EditUMKM({ params }: EditUMKMPageProps) {
  return <EditUMKMClient umkmId={params.id} />
}
