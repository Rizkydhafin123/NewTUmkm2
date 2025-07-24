import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"

// generateStaticParams harus ada untuk output: 'export' pada rute dinamis
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting...")
  console.log("generateStaticParams: hasNeon =", hasNeon)

  if (!hasNeon) {
    console.warn(
      "generateStaticParams: DATABASE_URL not set or Neon not configured. Returning empty array for static export.",
    )
    // Jika Neon tidak dikonfigurasi, kita tidak bisa mengambil jalur dinamis dari DB saat build.
    // Kembalikan array kosong agar Next.js tidak mencoba membuat halaman untuk setiap ID.
    // Komponen klien akan menangani pengambilan data.
    return []
  }

  try {
    console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB for static paths.")
    // Ambil hanya ID untuk meminimalkan data yang diambil saat build
    const allUmkm = await umkmService.getAll()
    console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

    if (allUmkm.length === 0) {
      console.log("generateStaticParams: No UMKM data found in DB. Returning empty array.")
      return []
    }

    const paths = allUmkm.map((umkm) => ({
      id: umkm.id!, // Pastikan ID ada dan string
    }))
    console.log("generateStaticParams: Generated paths:", paths)
    return paths
  } catch (error) {
    console.error("generateStaticParams: Error fetching UMKM for static params:", error)
    // Jika ada error saat menghubungkan ke Neon selama build,
    // kembalikan array kosong untuk mencegah kegagalan build.
    return []
  }
}

interface EditUMKMPageProps {
  params: {
    id: string
  }
}

export default function EditUMKM({ params }: EditUMKMPageProps) {
  return <EditUMKMClient umkmId={params.id} />
}
