"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { umkmService } from "@/lib/db"
import { useUser } from "@/lib/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { Loader2, Search, Edit, Trash, Download, Plus } from "lucide-react"
import Link from "next/link"

export default function UMKMPage() {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useUser()
  const [umkmList, setUmkmList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterJenis, setFilterJenis] = useState("Semua Jenis")
  const [filterStatus, setFilterStatus] = useState("Semua Status")

  useEffect(() => {
    async function fetchUmkm() {
      if (isUserLoading) return

      setLoading(true)
      setError(null)
      try {
        let data: any[] = []
        if (user?.role === "admin") {
          // Admin melihat semua UMKM di RW-nya
          console.log(`Fetching all UMKM for admin in RW: ${user.rw}`)
          data = await umkmService.getAll(undefined, user.rw)
        } else if (user?.id) {
          // User biasa hanya melihat UMKM miliknya
          console.log(`Fetching UMKM for user ID: ${user.id}`)
          data = await umkmService.getAll(user.id)
        } else {
          setError("Pengguna tidak terautentikasi atau data pengguna tidak lengkap.")
          console.error("User not authenticated or user data incomplete.")
          setLoading(false)
          return
        }
        setUmkmList(data)
        console.log("UMKM data fetched:", data)
      } catch (err) {
        console.error("Error fetching UMKM:", err)
        setError("Gagal memuat data UMKM. Silakan coba lagi.")
      } finally {
        setLoading(false)
      }
    }

    fetchUmkm()
  }, [user, isUserLoading])

  const filteredUmkm = umkmList.filter((umkm) => {
    const matchesSearch =
      umkm.nama_usaha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.pemilik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.jenis_usaha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      umkm.nomor_hp?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesJenis = filterJenis === "Semua Jenis" || umkm.jenis_usaha === filterJenis

    const matchesStatus = filterStatus === "Semua Status" || umkm.status === filterStatus

    return matchesSearch && matchesJenis && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus UMKM ini?")) {
      return
    }
    try {
      await umkmService.remove(id)
      setUmkmList(umkmList.filter((umkm) => umkm.id !== id))
      alert("UMKM berhasil dihapus!")
    } catch (err) {
      console.error("Error deleting UMKM:", err)
      alert("Gagal menghapus UMKM. Silakan coba lagi.")
    }
  }

  if (isUserLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <HeaderWithAuth title="Kelola Data UMKM" description="Manajemen lengkap data UMKM mikro di wilayah Anda">
        <Button variant="outline" className="rounded-lg border-border hover:bg-muted bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button asChild className="rounded-lg">
          <Link href="/umkm/tambah">
            <Plus className="h-4 w-4 mr-2" />
            Tambah UMKM
          </Link>
        </Button>
      </HeaderWithAuth>
      <NavigationWithAuth />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar UMKM Terdaftar</CardTitle>
            <CardDescription>Kelola dan pantau semua UMKM mikro di wilayah Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama usaha, pemilik, jenis usaha, atau nomor HP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Jenis">Semua Jenis</SelectItem>
                  <SelectItem value="Kuliner">Kuliner</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Kerajinan">Kerajinan</SelectItem>
                  <SelectItem value="Jasa">Jasa</SelectItem>
                  <SelectItem value="Otomotif">Otomotif</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Status">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  <SelectItem value="Dalam Proses">Dalam Proses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Usaha</TableHead>
                  <TableHead>Pemilik</TableHead>
                  <TableHead>Jenis Usaha</TableHead>
                  <TableHead>Nomor HP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUmkm.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Tidak ada data UMKM yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUmkm.map((umkm) => (
                    <TableRow key={umkm.id}>
                      <TableCell className="font-medium">{umkm.nama_usaha}</TableCell>
                      <TableCell>{umkm.pemilik}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {umkm.jenis_usaha}
                        </span>
                      </TableCell>
                      <TableCell>{umkm.nomor_hp || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            umkm.status === "Aktif"
                              ? "bg-green-50 text-green-700 ring-green-600/20"
                              : umkm.status === "Tidak Aktif"
                                ? "bg-red-50 text-red-700 ring-red-600/20"
                                : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                          }`}
                        >
                          {umkm.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" asChild>
                          <Link href={`/umkm/edit/${umkm.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(umkm.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
