"use client"

interface EditUMKMClientProps {
  umkmId: string
}

export default function EditUMKMClient({ umkmId }: EditUMKMClientProps) {
  return (
    <div>
      <h1>Edit UMKM Client Component</h1>
      <p>UMKM ID: {umkmId}</p>
      {/* Add your edit form and logic here */}
    </div>
  )
}
