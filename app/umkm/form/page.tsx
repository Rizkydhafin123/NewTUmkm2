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
import { useRouter, useSearchParams } from "next/navigation"
import { umkmService, type UMKM } from "@/lib/db"
import { ProtectedRoute } from "@/components/protected-route"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { useAuth } from "@/lib/auth"

function UMKMFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const umkmId = searchParams.get("id") // Get ID from URL for editing
  const { user, loading: userLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<UMKM>>({
    nama_usaha: "",
    pemilik: "",
    nik_pemilik: "",
    no_hp: "",
    alamat_usaha: "",
    jenis_usaha: "Kuliner", // Default value
    kategori_usaha: "",
    deskripsi_usaha: "",
    produk: "", // Tambahkan produk di sini
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
    status: "Aktif", // Default value
    tanggal_daftar: new Date().toISOString().split("T")[0],
    user_id: "", // Add user_id to formData state
    nib: "", // Tambahkan NIB di sini
  })

  useEffect(() => {
    if (userLoading) return

    if (!user) {
      setError("Anda harus login untuk mengakses fitur ini.")
      setLoading(false)
      return
    }

    const fetchUMKM = async () => {
      if (umkmId) {
        // Editing existing UMKM
        setLoading(true)
        setError(null)
        try {
          let umkmData: UMKM | null = null
          if (user.role === "admin") {
            // Admin can fetch any UMKM by ID
            umkmData = await umkmService.getById(umkmId)
          } else {
            // Regular user can only fetch their own UMKM
            umkmData = await umkmService.getById(umkmId, user.id)
          }

          if (umkmData) {
            setFormData({
              ...umkmData,
              kapasitas_produksi: umkmData.kapasitas_produksi || 0,
              satuan_produksi: umkmData.satuan_produksi || "",
              periode_operasi: umkmData.periode_operasi || 0,
              satuan_periode: umkmData.satuan_periode || "bulan",
              hari_kerja_per_minggu: umkmData.hari_kerja_per_minggu || 0,
              total_produksi: umkmData.total_produksi || 0,
              rab: umkmData.rab || 0,
              biaya_tetap: umkmData.biaya_tetap || 0,
              biaya_variabel: umkmData.biaya_variabel || 0,
              modal_awal: umkmData.modal_awal || 0,
              target_pendapatan: umkmData.target_pendapatan || 0,
              jumlah_karyawan: umkmData.jumlah_karyawan || 0,
              tanggal_daftar: umkmData.tanggal_daftar
                ? new Date(umkmData.tanggal_daftar).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              user_id: umkmData.user_id, // Ensure user_id is loaded into formData
              nib: umkmData.nib || "", // Pastikan NIB dimuat
              produk: umkmData.produk || "", // Pastikan Produk dimuat
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
      } else {
        // Adding new UMKM, no data to fetch
        setLoading(false)
      }
    }

    fetchUMKM()
  }, [umkmId, user, userLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      alert("Anda harus login untuk menyimpan UMKM.")
      return
    }

    if (!formData.nama_usaha || !formData.pemilik || !formData.jenis_usaha || !formData.status) {
      alert("Nama usaha, pemilik, jenis usaha, dan status harus diisi!")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const umkmPayload: Omit<UMKM, "id" | "created_at" | "updated_at"> = {
        nama_usaha: formData.nama_usaha!,
        pemilik: formData.pemilik!,
        nik_pemilik: formData.nik_pemilik || undefined,
        no_hp: formData.no_hp || undefined,
        alamat_usaha: formData.alamat_usaha || undefined,
        jenis_usaha: formData.jenis_usaha!,
        kategori_usaha: formData.kategori_usaha || undefined,
        deskripsi_usaha: formData.deskripsi_usaha || undefined,
        produk: formData.produk || undefined, // Tambahkan produk ke payload
        kapasitas_produksi: formData.kapasitas_produksi || 0,
        satuan_produksi: formData.satuan_produksi || undefined,
        periode_operasi: formData.periode_operasi || 0,
        satuan_periode: formData.satuan_periode || "bulan",
        hari_kerja_per_minggu: formData.hari_kerja_per_minggu || 0,
        total_produksi: formData.total_produksi || 0,
        rab: formData.rab || 0,
        biaya_tetap: formData.biaya_tetap || 0,
        biaya_variabel: formData.biaya_variabel || 0,
        modal_awal: formData.modal_awal || 0,
        target_pendapatan: formData.target_pendapatan || 0,
        jumlah_karyawan: formData.jumlah_karyawan || 0,
        status: formData.status!,
        tanggal_daftar: formData.tanggal_daftar || new Date().toISOString(),
        nib: formData.nib || undefined, // Tambahkan NIB ke payload
      }

      if (umkmId) {
        // When updating, use the original user_id of the UMKM
        // If for some reason user_id is not in formData (e.g., new entry before save), fallback to current user.id
        const targetUserId = formData.user_id || user.id
        await umkmService.update(umkmId, umkmPayload, targetUserId)
        alert("Data UMKM berhasil diperbarui!")
      } else {
        // Create new UMKM, use current user's ID
        await umkmService.create(umkmPayload, user.id)
        alert("UMKM berhasil didaftarkan!")
      }
      router.push("/umkm")
    } catch (err) {
      console.error("Error saving UMKM:", err)
      setError(`Gagal ${umkmId ? "memperbarui" : "mendaftarkan"} data UMKM. Silakan coba lagi.`)
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

  const pageTitle = umkmId ? "Edit Data UMKM" : "Daftarkan UMKM Baru"
  const pageDescription = umkmId
    ? "Perbarui informasi UMKM mikro"
    : "Isi formulir untuk menambahkan data UMKM mikro baru"
  const formTitle = umkmId ? "Form Edit UMKM Mikro" : "Form Pendaftaran UMKM Mikro"
  const formDescription = umkmId
    ? "Perbarui data UMKM untuk pencatatan di sistem"
    : "Lengkapi data UMKM untuk pencatatan di sistem"
  const submitButtonText = umkmId ? "Simpan Perubahan" : "Daftarkan UMKM"
  const savingButtonText = umkmId ? "Menyimpan..." : "Mendaftarkan..."

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <HeaderWithAuth title={pageTitle} description={pageDescription} />

      <NavigationWithAuth />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card shadow-lg border border-border rounded-xl">
          <CardHeader className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-xl">
            <CardTitle className="flex items-center text-xl">
              <Building2 className="h-6 w-6 mr-3" />
              {formTitle}
            </CardTitle>
            <CardDescription className="text-primary-foreground/90">{formDescription}</CardDescription>
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

                  {/* Input NIB baru */}
                  <div className="space-y-2">
                    <Label htmlFor="nib" className="text-sm font-medium text-foreground">
                      Nomor Induk Berusaha (NIB)
                    </Label>
                    <Input
                      id="nib"
                      value={formData.nib || ""}
                      onChange={(e) => handleChange("nib", e.target.value)}
                      placeholder="Contoh: 123456789012345"
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
                  <h3 className="text-xl font-semibold text-foreground">Kapasitas dan Operasional</h3>
                  <p className="text-muted-foreground mt-1">Data produksi dan operasional usaha</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kapasitas_produksi" className="text-sm font-medium text-foreground">
                      Kapasitas Produksi
                    </Label>
                    <Input
                      id="kapasitas_produksi"
                      type="number"
                      value={formData.kapasitas_produksi || 0}
                      onChange={(e) => handleChange("kapasitas_produksi", Number(e.target.value))}
                      placeholder="Jumlah"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan_produksi" className="text-sm font-medium text-foreground">
                      Satuan Produksi
                    </Label>
                    <Select
                      value={formData.satuan_produksi || ""}
                      onValueChange={(value) => handleChange("satuan_produksi", value)}
                    >
                      <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-lg">
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pcs</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="porsi">Porsi</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_produksi" className="text-sm font-medium text-foreground">
                      Total Produksi per Periode
                    </Label>
                    <Input
                      id="total_produksi"
                      type="number"
                      value={formData.total_produksi || 0}
                      onChange={(e) => handleChange("total_produksi", Number(e.target.value))}
                      placeholder="Total produksi"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periode_operasi" className="text-sm font-medium text-foreground">
                      Periode Operasi
                    </Label>
                    <Input
                      id="periode_operasi"
                      type="number"
                      value={formData.periode_operasi || 0}
                      onChange={(e) => handleChange("periode_operasi", Number(e.target.value))}
                      placeholder="Jumlah periode"
                      className="border-border focus:border-primary focus:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan_periode" className="text-sm font-medium text-foreground">
                      Satuan Periode
                    </Label>
                    <Select
                      value={formData.satuan_periode || "bulan"}
                      onValueChange={(value) => handleChange("satuan_periode", value)}
                    >
                      <SelectTrigger className="border-border focus:border-primary focus:ring-primary rounded-lg">
                        <SelectValue placeholder="Pilih satuan periode" />
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
                    <Label htmlFor="hari_kerja_per_minggu" className="text-sm font-medium text-foreground">
                      Hari Kerja per Minggu
                    </Label>
                    <Input
                      id="hari_kerja_per_minggu"
                      type="number"
                      value={formData.hari_kerja_per_minggu || 0}
                      onChange={(e) => handleChange("hari_kerja_per_minggu", Number(e.target.value))}
                      placeholder="Jumlah hari"
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
                      {savingButtonText}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {submitButtonText}
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

export default function UMKMFormPage() {
  return (
    <ProtectedRoute>
      <UMKMFormContent />
    </ProtectedRoute>
  )
}
