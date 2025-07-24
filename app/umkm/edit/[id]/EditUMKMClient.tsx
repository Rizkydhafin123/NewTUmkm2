"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Building2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { umkmService, type UMKM } from "@/lib/db"
import { useAuth } from "@/lib/auth"

interface EditUMKMClientProps {
  umkmId: string
}

export default function EditUMKMClient({ umkmId }: EditUMKMClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<UMKM>>({
    nama_usaha: "",
    pemilik: "",
    nik_pemilik: "",
    no_hp: "",
    alamat_usaha: "",
    jenis_usaha: "",
    kategori_usaha: "",
    deskripsi_usaha: "",
    produk: "",
    kapasitas_produksi: 0,
    satuan_produksi: "",
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
    status: "Aktif",
    tanggal_daftar: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const fetchUMKM = async () => {
      if (!user?.id) {
        setError("Anda harus login untuk mengedit UMKM.")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const umkmData = await umkmService.getById(umkmId, user.id)
        if (umkmData) {
          setFormData({
            ...umkmData,
            tanggal_daftar: umkmData.tanggal_daftar
              ? new Date(umkmData.tanggal_daftar).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
          })
        } else {
          setError("Data UMKM tidak ditemukan atau Anda tidak memiliki akses.")
        }
      } catch (err) {
        console.error("Error fetching UMKM:", err)
        setError("Gagal memuat data UMKM. Silakan coba lagi.")
      } finally {
        setLoading(false)
      }
    }

    fetchUMKM()
  }, [umkmId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      alert("Anda harus login untuk mengupdate UMKM.")
      return
    }

    if (!formData.nama_usaha || !formData.pemilik || !formData.jenis_usaha || !formData.status) {
      alert("Nama usaha, pemilik, jenis usaha, dan status harus diisi!")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await umkmService.update(umkmId, formData, user.id)
      alert("Data UMKM berhasil diperbarui!")
      router.push("/umkm")
    } catch (err) {
      console.error("Error updating UMKM:", err)
      setError("Gagal memperbarui data UMKM. Silakan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/umkm")} className="mt-4">
            Kembali ke Daftar UMKM
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button variant="ghost" asChild className="mr-4 rounded-lg hover:bg-muted">
                <Link href="/umkm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Data UMKM</h1>
                <p className="text-sm text-muted-foreground">Perbarui informasi UMKM mikro</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/" className="px-3 py-4 text-sm font-medium hover:bg-primary/80">
              Dashboard
            </Link>
            <Link href="/warga" className="px-3 py-4 text-sm font-medium hover:bg-primary/80">
              Data Warga
            </Link>
            <Link href="/umkm" className="px-3 py-4 text-sm font-medium bg-primary/80">
              Data UMKM
            </Link>
            <Link href="/surat" className="px-3 py-4 text-sm font-medium hover:bg-primary/80">
              Surat-Menyurat
            </Link>
            <Link href="/laporan" className="px-3 py-4 text-sm font-medium hover:bg-primary/80">
              Laporan
            </Link>
            <Link href="/keuangan" className="px-3 py-4 text-sm font-medium hover:bg-primary/80">
              Keuangan
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card shadow-lg border border-border rounded-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-xl">
            <CardTitle className="flex items-center text-xl">
              <Building2 className="h-6 w-6 mr-3" />
              Form Edit UMKM Mikro
            </CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Perbarui data UMKM untuk pencatatan di sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-xl font-semibold text-foreground">Identitas Usaha</h3>
                  <p className="text-muted-foreground mt-1">Informasi dasar tentang usaha</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama_usaha" className="text-sm font-medium text-foreground">
                      Nama Usaha *
                    </Label>
                    <Input
                      id="nama_usaha"
                      value={formData.nama_usaha || ""}
                      onChange={(e) => handleChange("nama_usaha", e.target.value)}
                      placeholder="Contoh: Warung Makan Bu Sari"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pemilik" className="text-sm font-medium text-foreground">
                      Nama Pemilik *
                    </Label>
                    <Input
                      id="pemilik"
                      value={formData.pemilik || ""}
                      onChange={(e) => handleChange("pemilik", e.target.value)}
                      placeholder="Nama lengkap pemilik usaha"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nik_pemilik" className="text-sm font-medium text-foreground">
                      NIK Pemilik
                    </Label>
                    <Input
                      id="nik_pemilik"
                      value={formData.nik_pemilik || ""}
                      onChange={(e) => handleChange("nik_pemilik", e.target.value)}
                      placeholder="16 digit NIK"
                      maxLength={16}
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="no_hp" className="text-sm font-medium text-foreground">
                      Nomor HP
                    </Label>
                    <Input
                      id="no_hp"
                      value={formData.no_hp || ""}
                      onChange={(e) => handleChange("no_hp", e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jenis_usaha" className="text-sm font-medium text-foreground">
                      Jenis Usaha *
                    </Label>
                    <Select
                      value={formData.jenis_usaha || ""}
                      onValueChange={(value) => handleChange("jenis_usaha", value)}
                    >
                      <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-lg">
                        <SelectValue placeholder="Pilih jenis usaha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kuliner">Kuliner</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                        <SelectItem value="Jasa">Jasa</SelectItem>
                        <SelectItem value="Perdagangan">Perdagangan</SelectItem>
                        <SelectItem value="Teknologi">Teknologi</SelectItem>
                        <SelectItem value="Pertanian">Pertanian</SelectItem>
                        <SelectItem value="Otomotif">Otomotif</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="alamat_usaha" className="text-sm font-medium text-foreground">
                      Alamat Usaha
                    </Label>
                    <Textarea
                      id="alamat_usaha"
                      value={formData.alamat_usaha || ""}
                      onChange={(e) => handleChange("alamat_usaha", e.target.value)}
                      placeholder="Alamat lengkap lokasi usaha"
                      className="min-h-[80px] border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-foreground">Kategori dan Deskripsi</h3>
                  <p className="text-muted-foreground mt-1">Detail tentang jenis dan skala usaha</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kategori_usaha" className="text-sm font-medium text-foreground">
                      Kategori Usaha
                    </Label>
                    <Select
                      value={formData.kategori_usaha || ""}
                      onValueChange={(value) => handleChange("kategori_usaha", value)}
                    >
                      <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-lg">
                        <SelectValue placeholder="Pilih kategori usaha" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mikro">Mikro</SelectItem>
                        <SelectItem value="Kecil">Kecil</SelectItem>
                        <SelectItem value="Menengah">Menengah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-foreground">
                      Status Operasional *
                    </Label>
                    <Select value={formData.status || ""} onValueChange={(value) => handleChange("status", value)}>
                      <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-lg">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                        <SelectItem value="Tutup Sementara">Tutup Sementara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="deskripsi_usaha" className="text-sm font-medium text-foreground">
                      Deskripsi Usaha
                    </Label>
                    <Textarea
                      id="deskripsi_usaha"
                      value={formData.deskripsi_usaha || ""}
                      onChange={(e) => handleChange("deskripsi_usaha", e.target.value)}
                      placeholder="Jelaskan produk/jasa yang ditawarkan, target pasar, dll"
                      className="min-h-[100px] border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-foreground">Produk/Layanan</h3>
                  <p className="text-muted-foreground mt-1">Informasi detail tentang produk atau layanan utama</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="produk" className="text-sm font-medium text-foreground">
                      Produk/Layanan Utama
                    </Label>
                    <Input
                      id="produk"
                      value={formData.produk || ""}
                      onChange={(e) => handleChange("produk", e.target.value)}
                      placeholder="Contoh: Nasi Goreng, Jilbab Syar'i, Jasa Desain Grafis"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-xl font-semibold text-foreground">Data Keuangan & Karyawan</h3>
                  <p className="text-muted-foreground mt-1">
                    Informasi terkait aspek finansial dan sumber daya manusia
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="modal_awal" className="text-sm font-medium text-foreground">
                      Modal Awal (Rp)
                    </Label>
                    <Input
                      id="modal_awal"
                      type="number"
                      value={formData.modal_awal || 0}
                      onChange={(e) => handleChange("modal_awal", Number(e.target.value))}
                      placeholder="Contoh: 10000000"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rab" className="text-sm font-medium text-foreground">
                      Rencana Anggaran Biaya (Rp)
                    </Label>
                    <Input
                      id="rab"
                      type="number"
                      value={formData.rab || 0}
                      onChange={(e) => handleChange("rab", Number(e.target.value))}
                      placeholder="Contoh: 7000000"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlah_karyawan" className="text-sm font-medium text-foreground">
                      Jumlah Karyawan
                    </Label>
                    <Input
                      id="jumlah_karyawan"
                      type="number"
                      value={formData.jumlah_karyawan || 0}
                      onChange={(e) => handleChange("jumlah_karyawan", Number(e.target.value))}
                      placeholder="Contoh: 2"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_pendapatan" className="text-sm font-medium text-foreground">
                      Target Pendapatan (Rp)
                    </Label>
                    <Input
                      id="target_pendapatan"
                      type="number"
                      value={formData.target_pendapatan || 0}
                      onChange={(e) => handleChange("target_pendapatan", Number(e.target.value))}
                      placeholder="Contoh: 15000000"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_daftar" className="text-sm font-medium text-foreground">
                  Tanggal Daftar
                </Label>
                <Input
                  id="tanggal_daftar"
                  type="date"
                  value={formData.tanggal_daftar || ""}
                  onChange={(e) => handleChange("tanggal_daftar", e.target.value)}
                  className="border-border focus:border-primary focus:ring-primary rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="px-8 py-2 border-border hover:bg-muted bg-transparent rounded-lg"
                  disabled={saving}
                >
                  <Link href="/umkm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Batal
                  </Link>
                </Button>
                <Button type="submit" className="px-8 py-2 bg-primary hover:bg-primary/90 rounded-lg" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
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
