"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
// Import `isValidUUID` dari `lib/db`
import { umkmService, type UMKM, isValidUUID } from "@/lib/db"
import { ProtectedRoute } from "@/components/protected-route"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { useAuth } from "@/lib/auth"

interface EditUMKMClientProps {
  umkmId: string
}

function EditUMKMContent({ umkmId }: EditUMKMClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<UMKM>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUMKMData = async () => {
      // Di dalam fungsi `EditUMKMContent`, di awal `loadUMKMData`
      // Tambahkan validasi ID UMKM
      if (!isValidUUID(umkmId)) {
        setError("ID UMKM tidak valid.")
        setLoading(false)
        return
      }
      if (!user) {
        router.push("/login")
        return
      }
      setLoading(true)
      try {
        // For admin, allow fetching any UMKM by ID. For regular user, only their own.
        const data = await umkmService.getById(umkmId, user.role === "admin" ? undefined : user.id)
        if (data) {
          setFormData(data)
        } else {
          setError("Data UMKM tidak ditemukan atau Anda tidak memiliki akses.")
        }
      } catch (err) {
        console.error("Error loading UMKM data:", err)
        setError("Gagal memuat data UMKM. Silakan coba lagi.")
      } finally {
        setLoading(false)
      }
    }

    loadUMKMData()
  }, [umkmId, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: keyof UMKM, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!user?.id) {
      setError("Anda harus login untuk mengedit data UMKM.")
      setSubmitting(false)
      return
    }

    // Basic validation
    if (!formData.nama_usaha || !formData.pemilik || !formData.jenis_usaha || !formData.status) {
      setError("Nama Usaha, Pemilik, Jenis Usaha, dan Status harus diisi.")
      setSubmitting(false)
      return
    }

    try {
      // Filter out financial and other removed fields before sending to update
      const updatePayload: Partial<UMKM> = {
        nama_usaha: formData.nama_usaha!,
        pemilik: formData.pemilik!,
        nik_pemilik: formData.nik_pemilik || undefined,
        no_hp: undefined, // Removed from form, set to undefined
        alamat_usaha: formData.alamat_usaha || undefined,
        jenis_usaha: formData.jenis_usaha!,
        kategori_usaha: formData.kategori_usaha || undefined,
        deskripsi_usaha: formData.deskripsi_usaha || undefined,
        produk: formData.produk || undefined,
        status: formData.status!,
        tanggal_daftar: formData.tanggal_daftar || undefined,
        // Set removed numeric fields to 0 or default if they exist in DB schema
        kapasitas_produksi: 0,
        satuan_produksi: undefined,
        periode_operasi: 0,
        satuan_periode: "bulan",
        hari_kerja_per_minggu: 0,
        total_produksi: 0,
        rab: 0,
        biaya_tetap: 0,
        biaya_variabel: 0,
        modal_awal: 0,
        target_pendapatan: 0,
        jumlah_karyawan: 0,
      }

      // Determine which user_id to use for update based on role
      const userIdForUpdate = user.role === "admin" ? formData.user_id! : user.id

      await umkmService.update(umkmId, updatePayload, userIdForUpdate)
      router.push("/umkm") // Redirect to UMKM list page
    } catch (err) {
      console.error("Error updating UMKM:", err)
      setError("Gagal memperbarui data UMKM. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data UMKM...</p>
        </div>
      </div>
    )
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <CardTitle className="text-2xl font-bold text-destructive mb-4">Error</CardTitle>
          <CardDescription className="text-muted-foreground mb-6">{error}</CardDescription>
          <Button onClick={() => router.push("/umkm")}>Kembali ke Daftar UMKM</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-6 lg:p-8">
      <HeaderWithAuth title="Edit Data UMKM" description="Perbarui informasi UMKM">
        <Button
          variant="outline"
          onClick={() => router.push("/umkm")}
          className="rounded-lg border-border hover:bg-muted bg-transparent"
        >
          Kembali
        </Button>
      </HeaderWithAuth>
      <NavigationWithAuth />
      <main className="max-w-4xl mx-auto">
        <Card className="bg-card shadow-lg border border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Edit Data UMKM</CardTitle>
            <CardDescription className="text-muted-foreground">
              Perbarui informasi detail UMKM mikro ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nama_usaha">Nama Usaha</Label>
                <Input
                  id="nama_usaha"
                  value={formData.nama_usaha || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Warung Kopi Bahagia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemilik">Nama Pemilik</Label>
                <Input
                  id="pemilik"
                  value={formData.pemilik || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik_pemilik">NIK Pemilik (Opsional)</Label>
                <Input
                  id="nik_pemilik"
                  value={formData.nik_pemilik || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 1234567890123456"
                />
              </div>
              {/* No HP field removed */}
              <div className="space-y-2 col-span-full">
                <Label htmlFor="alamat_usaha">Alamat Usaha (Opsional)</Label>
                <Textarea
                  id="alamat_usaha"
                  value={formData.alamat_usaha || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Merdeka No. 10, RT 001/RW 001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis_usaha">Jenis Usaha</Label>
                <Select
                  value={formData.jenis_usaha || ""}
                  onValueChange={(value) => handleSelectChange("jenis_usaha", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Usaha" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kuliner">Kuliner</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                    <SelectItem value="Jasa">Jasa</SelectItem>
                    <SelectItem value="Perdagangan">Perdagangan</SelectItem>
                    <SelectItem value="Teknologi">Teknologi</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori_usaha">Kategori Usaha (Opsional)</Label>
                <Input
                  id="kategori_usaha"
                  value={formData.kategori_usaha || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Makanan Berat, Pakaian Muslim"
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="deskripsi_usaha">Deskripsi Usaha (Opsional)</Label>
                <Textarea
                  id="deskripsi_usaha"
                  value={formData.deskripsi_usaha || ""}
                  onChange={handleChange}
                  placeholder="Jelaskan secara singkat tentang usaha ini..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="produk">Produk/Layanan Utama (Opsional)</Label>
                <Input
                  id="produk"
                  value={formData.produk || ""}
                  onChange={handleChange}
                  placeholder="Contoh: Nasi Goreng, Jilbab Syar'i"
                />
              </div>
              {/* Kapasitas dan Operasional section removed */}
              {/* Rencana Anggaran dan Biaya section removed */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="Tutup Sementara">Tutup Sementara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal_daftar">Tanggal Daftar (Opsional)</Label>
                <Input
                  id="tanggal_daftar"
                  type="date"
                  value={formData.tanggal_daftar ? formData.tanggal_daftar.split("T")[0] : ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-full flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={() => router.push("/umkm")} disabled={submitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function EditUMKMClientWrapper({ umkmId }: EditUMKMClientProps) {
  return (
    <ProtectedRoute>
      <EditUMKMContent umkmId={umkmId} />
    </ProtectedRoute>
  )
}
