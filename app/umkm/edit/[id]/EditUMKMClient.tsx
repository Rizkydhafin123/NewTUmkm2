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
import { umkmService, type UMKM } from "@/lib/db"
import { useAuth } from "@/lib/auth"

interface EditUMKMClientProps {
  umkmId: string // umkmId diterima sebagai prop
}

export default function EditUMKMClient({ umkmId }: EditUMKMClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<Partial<UMKM>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUMKMData = async () => {
      if (!user) {
        console.log("User not authenticated, redirecting to /login.")
        router.push("/login")
        return
      }
      setLoading(true)
      try {
        const data = await umkmService.getById(umkmId, user.role === "admin" ? undefined : user.id)
        if (data) {
          setFormData(data)
        } else {
          setError("Data UMKM tidak ditemukan atau Anda tidak memiliki akses.")
          console.log("UMKM data not found or no access, redirecting to /umkm.")
          router.push("/umkm") // Redirect ke daftar UMKM jika data tidak ditemukan
        }
      } catch (err) {
        console.error("Error loading UMKM data:", err)
        setError("Gagal memuat data UMKM. Silakan coba lagi.")
        console.log("Error loading UMKM data, redirecting to /umkm.")
        router.push("/umkm") // Redirect ke daftar UMKM jika ada error saat memuat
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
      // Pastikan nilai numerik di-parse dengan benar
      const updateData = {
        ...formData,
        kapasitas_produksi: formData.kapasitas_produksi ? Number(formData.kapasitas_produksi) : undefined,
        periode_operasi: formData.periode_operasi ? Number(formData.periode_operasi) : undefined,
        hari_kerja_per_minggu: formData.hari_kerja_per_minggu ? Number(formData.hari_kerja_per_minggu) : undefined,
        total_produksi: formData.total_produksi ? Number(formData.total_produksi) : undefined,
        rab: formData.rab ? Number(formData.rab) : undefined,
        biaya_tetap: formData.biaya_tetap ? Number(formData.biaya_tetap) : undefined,
        biaya_variabel: formData.biaya_variabel ? Number(formData.biaya_variabel) : undefined,
        modal_awal: formData.modal_awal ? Number(formData.modal_awal) : undefined,
        target_pendapatan: formData.target_pendapatan ? Number(formData.target_pendapatan) : undefined,
        jumlah_karyawan: formData.jumlah_karyawan ? Number(formData.jumlah_karyawan) : undefined,
      }

      await umkmService.update(umkmId, updateData, user.role === "admin" ? formData.user_id! : user.id)
      console.log("UMKM updated successfully. Redirecting to /umkm.") // Log ini akan muncul di konsol browser
      router.push("/umkm") // Redirect ke halaman daftar UMKM
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
              <div className="space-y-2">
                <Label htmlFor="no_hp">Nomor HP (Opsional)</Label>
                <Input
                  id="no_hp"
                  value={formData.no_hp || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 081234567890"
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="kapasitas_produksi">Kapasitas Produksi (Opsional)</Label>
                <Input
                  id="kapasitas_produksi"
                  type="number"
                  value={formData.kapasitas_produksi || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satuan_produksi">Satuan Produksi (Opsional)</Label>
                <Input
                  id="satuan_produksi"
                  value={formData.satuan_produksi || ""}
                  onChange={handleChange}
                  placeholder="Contoh: porsi/hari, pcs/minggu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode_operasi">Periode Operasi (Opsional)</Label>
                <Input
                  id="periode_operasi"
                  type="number"
                  value={formData.periode_operasi || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satuan_periode">Satuan Periode (Opsional)</Label>
                <Select
                  value={formData.satuan_periode || "bulan"}
                  onValueChange={(value) => handleSelectChange("satuan_periode", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Satuan Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hari">Hari</SelectItem>
                    <SelectItem value="minggu">Minggu</SelectItem>
                    <SelectItem value="bulan">Bulan</SelectItem>
                    <SelectItem value="tahun">Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hari_kerja_per_minggu">Hari Kerja per Minggu (Opsional)</Label>
                <Input
                  id="hari_kerja_per_minggu"
                  type="number"
                  value={formData.hari_kerja_per_minggu || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_produksi">Total Produksi (Opsional)</Label>
                <Input
                  id="total_produksi"
                  type="number"
                  value={formData.total_produksi || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rab">RAB (Rencana Anggaran Biaya) (Opsional)</Label>
                <Input
                  id="rab"
                  type="number"
                  value={formData.rab || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 5000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biaya_tetap">Biaya Tetap (Opsional)</Label>
                <Input
                  id="biaya_tetap"
                  type="number"
                  value={formData.biaya_tetap || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 1000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="biaya_variabel">Biaya Variabel (Opsional)</Label>
                <Input
                  id="biaya_variabel"
                  type="number"
                  value={formData.biaya_variabel || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal_awal">Modal Awal (Opsional)</Label>
                <Input
                  id="modal_awal"
                  type="number"
                  value={formData.modal_awal || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 2000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_pendapatan">Target Pendapatan (Opsional)</Label>
                <Input
                  id="target_pendapatan"
                  type="number"
                  value={formData.target_pendapatan || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 7000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah_karyawan">Jumlah Karyawan (Opsional)</Label>
                <Input
                  id="jumlah_karyawan"
                  type="number"
                  value={formData.jumlah_karyawan || ""}
                  onChange={handleChange}
                  placeholder="Contoh: 2"
                />
              </div>
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
              <div className="col-span-full flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push("/umkm")}
                  disabled={submitting}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto order-1 sm:order-2">
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
