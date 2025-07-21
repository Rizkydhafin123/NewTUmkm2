"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { umkmService } from "@/lib/db"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface EditUMKMClientProps {
  umkmId: string
}

export default function EditUMKMClient({ umkmId }: EditUMKMClientProps) {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [umkm, setUmkm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUmkmData() {
      if (!umkmId || isUserLoading) return

      setLoading(true)
      setError(null)
      try {
        console.log(`EditUMKMClient: Fetching UMKM with ID: ${umkmId}`)
        const data = await umkmService.getById(umkmId)
        if (data) {
          setUmkm(data)
          console.log("EditUMKMClient: UMKM data fetched successfully:", data)
        } else {
          setError("UMKM tidak ditemukan.")
          console.error("EditUMKMClient: UMKM not found for ID:", umkmId)
        }
      } catch (err) {
        console.error("EditUMKMClient: Error fetching UMKM data:", err)
        setError("Gagal memuat data UMKM. Silakan coba lagi.")
      } finally {
        setLoading(false)
      }
    }

    fetchUmkmData()
  }, [umkmId, isUserLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!umkm || !user) return

    setSubmitting(true)
    setError(null)

    // Validasi sederhana
    if (!umkm.nama_usaha || !umkm.jenis_usaha || !umkm.status) {
      alert("Nama Usaha, Jenis Usaha, dan Status harus diisi.")
      setSubmitting(false)
      return
    }

    try {
      const updatedUmkm = {
        ...umkm,
        // Pastikan nilai numerik di-parse dengan benar
        modal_usaha: umkm.modal_usaha ? Number.parseFloat(umkm.modal_usaha) : null,
        omset_bulanan: umkm.omset_bulanan ? Number.parseFloat(umkm.omset_bulanan) : null,
        jumlah_karyawan: umkm.jumlah_karyawan ? Number.parseInt(umkm.jumlah_karyawan, 10) : null,
      }

      console.log("EditUMKMClient: Submitting updated UMKM data:", updatedUmkm)
      await umkmService.update(umkmId, updatedUmkm)
      console.log("EditUMKMClient: UMKM updated successfully. Redirecting to /umkm.")
      router.push("/umkm") // Redirect ke halaman daftar UMKM
    } catch (err) {
      console.error("EditUMKMClient: Error updating UMKM:", err)
      setError("Gagal memperbarui UMKM. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data UMKM...</span>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)] text-red-500">{error}</div>
  }

  if (!umkm) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-gray-500">
        Data UMKM tidak ditemukan.
      </div>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Data UMKM</CardTitle>
          <CardDescription>Perbarui informasi UMKM yang sudah ada.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="nama_usaha">Nama Usaha</Label>
              <Input
                id="nama_usaha"
                value={umkm.nama_usaha || ""}
                onChange={(e) => setUmkm({ ...umkm, nama_usaha: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pemilik">Nama Pemilik</Label>
              <Input
                id="pemilik"
                value={umkm.pemilik || ""}
                onChange={(e) => setUmkm({ ...umkm, pemilik: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jenis_usaha">Jenis Usaha</Label>
              <Select
                value={umkm.jenis_usaha || ""}
                onValueChange={(value) => setUmkm({ ...umkm, jenis_usaha: value })}
                required
              >
                <SelectTrigger id="jenis_usaha">
                  <SelectValue placeholder="Pilih Jenis Usaha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kuliner">Kuliner</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                  <SelectItem value="Jasa">Jasa</SelectItem>
                  <SelectItem value="Otomotif">Otomotif</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={umkm.alamat || ""}
                onChange={(e) => setUmkm({ ...umkm, alamat: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nomor_hp">Nomor HP</Label>
              <Input
                id="nomor_hp"
                value={umkm.nomor_hp || ""}
                onChange={(e) => setUmkm({ ...umkm, nomor_hp: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={umkm.email || ""}
                onChange={(e) => setUmkm({ ...umkm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modal_usaha">Modal Usaha (Rp)</Label>
              <Input
                id="modal_usaha"
                type="number"
                value={umkm.modal_usaha || ""}
                onChange={(e) => setUmkm({ ...umkm, modal_usaha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="omset_bulanan">Omset Bulanan (Rp)</Label>
              <Input
                id="omset_bulanan"
                type="number"
                value={umkm.omset_bulanan || ""}
                onChange={(e) => setUmkm({ ...umkm, omset_bulanan: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jumlah_karyawan">Jumlah Karyawan</Label>
              <Input
                id="jumlah_karyawan"
                type="number"
                value={umkm.jumlah_karyawan || ""}
                onChange={(e) => setUmkm({ ...umkm, jumlah_karyawan: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tahun_berdiri">Tahun Berdiri</Label>
              <Input
                id="tahun_berdiri"
                type="number"
                value={umkm.tahun_berdiri || ""}
                onChange={(e) => setUmkm({ ...umkm, tahun_berdiri: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={umkm.status || ""} onValueChange={(value) => setUmkm({ ...umkm, status: value })} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={umkm.deskripsi || ""}
                onChange={(e) => setUmkm({ ...umkm, deskripsi: e.target.value })}
              />
            </div>
            <div className="col-span-full flex justify-end gap-2">
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
  )
}
