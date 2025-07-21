import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"

// Tambahkan logging dan penanganan error yang lebih eksplisit di generateStaticParams
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting...")
  console.log("generateStaticParams: hasNeon =", hasNeon)

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
    console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB.")
    const allUmkm = await umkmService.getAll() // Ini memanggil layanan DB
    console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

    if (allUmkm.length === 0) {
      console.log("generateStaticParams: No UMKM data found in DB. Returning dummy ID.")
      return [{ id: "dummy-id" }]
    }

    const paths = allUmkm.map((umkm) => ({
      id: umkm.id!, // Pastikan ID ada dan string
    }))
    console.log("generateStaticParams: Generated paths:", paths)
    return paths
  } catch (error) {
    console.error("generateStaticParams: Error fetching UMKM for static params:", error)
    // Jika ada error saat menghubungkan ke Neon selama build,
    // kembalikan ID dummy untuk mencegah kegagalan build.
    return [{ id: "error-fallback-id" }]
  }
}

export default function EditUMKM() {
  return <EditUMKMClient />
}
