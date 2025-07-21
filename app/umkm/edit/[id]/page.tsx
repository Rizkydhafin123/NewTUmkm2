import { umkmService, hasNeon } from "@/lib/db"
import EditUMKMClient from "./EditUMKMClient"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// generateStaticParams diperlukan untuk output: 'export' dengan rute dinamis
export async function generateStaticParams() {
  console.log("generateStaticParams: Starting...")
  console.log("generateStaticParams: hasNeon =", hasNeon)

  if (!hasNeon) {
    console.warn(
      "generateStaticParams: DATABASE_URL not set or Neon not configured. Returning dummy ID for static export.",
    )
    return [{ id: "dummy-id" }]
  }

  try {
    console.log("generateStaticParams: Attempting to fetch all UMKM from Neon DB.")
    const allUmkm = await umkmService.getAll()
    console.log(`generateStaticParams: Fetched ${allUmkm.length} UMKM items.`)

    if (allUmkm.length === 0) {
      console.log("generateStaticParams: No UMKM data found in DB. Returning dummy ID.")
      return [{ id: "dummy-id" }]
    }

    const paths = allUmkm.map((umkm) => ({
      id: umkm.id!,
    }))
    console.log("generateStaticParams: Generated paths:", paths)
    return paths
  } catch (error) {
    console.error("generateStaticParams: Error fetching UMKM for static params:", error)
    return [{ id: "error-fallback-id" }]
  }
}

export default function EditUMKMPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <HeaderWithAuth title="Edit Data UMKM" description="Perbarui informasi UMKM">
        <Button variant="outline" asChild className="rounded-lg border-border hover:bg-muted bg-transparent">
          <Link href="/umkm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
      </HeaderWithAuth>
      <NavigationWithAuth />
      <EditUMKMClient umkmId={params.id} />
    </div>
  )
}
