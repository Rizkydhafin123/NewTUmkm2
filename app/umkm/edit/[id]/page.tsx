import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"

// generateStaticParams harus ada untuk output: 'export' pada rute dinamis
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting...")
  console.log("generateStaticParams: hasNeon =", hasNeon)

  let paths: { id: string }[] = []

  if (!hasNeon) {
    console.warn(
      "generateStaticParams: DATABASE_URL not set or Neon not configured. Returning dummy path for static export.",
    )
    // Jika Neon tidak dikonfigurasi, kita tidak bisa mengambil jalur dinamis dari DB saat build.
    // Kembalikan path dummy agar Next.js tetap membuat file HTML untuk rute dinamis.
    paths = [{ id: "dummy-id" }] // Mengembalikan ID dummy
  } else {
    try {
      console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB for static paths.")
      // Ambil hanya ID untuk meminimalkan data yang diambil saat build
      const allUmkm = await umkmService.getAll()
      console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

      if (allUmkm.length === 0) {
        console.log("generateStaticParams: No UMKM data found in DB. Returning dummy path.")
        paths = [{ id: "dummy-id" }] // Mengembalikan ID dummy jika tidak ada data
      } else {
        paths = allUmkm.map((umkm) => ({
          id: umkm.id!, // Pastikan ID ada dan string
        }))
      }
    } catch (error) {
      console.error("generateStaticParams: Error fetching UMKM for static params:", error)
      // Jika ada error saat menghubungkan ke Neon selama build,
      // kembalikan path dummy untuk mencegah kegagalan build.
      paths = [{ id: "dummy-id" }] // Mengembalikan ID dummy jika ada error
    }
  }

  console.log("generateStaticParams: Generated paths:", paths)
  return paths
}

interface EditUMKMPageProps {
  params: {
    id: string
  }
}

export default function EditUMKM({ params }: EditUMKMPageProps) {
  return <EditUMKMClient umkmId={params.id} />
}
