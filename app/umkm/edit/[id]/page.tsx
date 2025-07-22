import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClientWrapper from "./EditUMKMClient" // Renamed to avoid conflict

// Tambahkan logging dan penanganan error yang lebih eksplisit di generateStaticParams
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting static page generation for UMKM edit routes.")
  console.log(`generateStaticParams: Checking DATABASE_URL status. Has Neon: ${hasNeon}`)

  if (!hasNeon) {
    console.warn(
      "generateStaticParams: DATABASE_URL not set or Neon not configured. Returning dummy ID for static export.",
    )
    // Jika Neon tidak dikonfigurasi, kita tidak bisa mengambil jalur dinamis dari DB saat build.
    // Kembalikan set jalur minimal agar build bisa selesai.
    // Komponen klien akan menangani kasus "data tidak ditemukan".
    return [{ id: "dummy-id" }]
  }

  try {
    console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB for static paths.")
    const allUmkm = await umkmService.getAll() // Ini memanggil layanan DB
    console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

    if (allUmkm.length === 0) {
      console.warn(
        "generateStaticParams: No UMKM data found in DB. This might lead to 404s for actual UMKM IDs if the database is empty or inaccessible during build. Returning dummy ID for static export.",
      )
      return [{ id: "dummy-id" }]
    }

    const paths = allUmkm.map((umkm) => ({
      id: umkm.id!, // Pastikan ID ada dan string
    }))
    console.log("generateStaticParams: Generated paths:", paths)
    return paths
  } catch (error) {
    console.error(
      "generateStaticParams: CRITICAL ERROR fetching UMKM for static params. This will likely cause 404s for UMKM edit pages.",
      error,
    )
    // Jika ada error saat menghubungkan ke Neon selama build,
    // kembalikan ID dummy untuk mencegah kegagalan build.
    return [{ id: "error-fallback-id" }]
  }
}

interface EditUMKMPageProps {
  params: {
    id: string
  }
}

export default function EditUMKM({ params }: EditUMKMPageProps) {
  return <EditUMKMClientWrapper umkmId={params.id} />
}
