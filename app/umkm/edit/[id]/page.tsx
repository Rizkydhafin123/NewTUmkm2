import EditUMKMClient from "./EditUMKMClient"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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
      {/* Meneruskan id dari params ke client component */}
      <EditUMKMClient umkmId={params.id} />
    </div>
  )
}
