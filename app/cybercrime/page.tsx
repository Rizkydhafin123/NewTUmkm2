import { HeaderWithAuth } from "@/components/header-with-auth"
import { NavigationWithAuth } from "@/components/navigation-with-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"

export default function CybercrimePage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "user"]}>
      <HeaderWithAuth />
      <NavigationWithAuth />
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Informasi Cybercrime & Keamanan Digital</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Apa itu Cybercrime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Cybercrime adalah aktivitas kejahatan yang melibatkan komputer atau jaringan komputer, baik sebagai
                alat, target, atau tempat terjadinya kejahatan. Ini mencakup berbagai jenis pelanggaran hukum yang
                dilakukan secara online.
              </p>
              <p>
                Contoh umum termasuk penipuan online, peretasan, pencurian identitas, penyebaran malware, dan kejahatan
                siber lainnya yang memanfaatkan teknologi digital.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Jenis-jenis Cybercrime Umum</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Phishing:</strong> Upaya untuk mendapatkan informasi sensitif seperti nama pengguna, kata
                  sandi, dan detail kartu kredit, seringkali dengan menyamar sebagai entitas tepercaya.
                </li>
                <li>
                  <strong>Malware:</strong> Perangkat lunak berbahaya seperti virus, ransomware, dan spyware yang
                  dirancang untuk merusak, mengganggu, atau mendapatkan akses tidak sah ke sistem komputer.
                </li>
                <li>
                  <strong>Pencurian Identitas:</strong> Penggunaan informasi pribadi orang lain secara tidak sah untuk
                  keuntungan finansial atau tujuan lain.
                </li>
                <li>
                  <strong>Penipuan Online:</strong> Berbagai skema penipuan yang dilakukan melalui internet, seperti
                  penipuan investasi, lotere palsu, atau penipuan belanja online.
                </li>
                <li>
                  <strong>DDoS (Distributed Denial of Service):</strong> Serangan yang bertujuan membuat layanan online
                  tidak tersedia dengan membanjiri target dengan lalu lintas internet.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips Keamanan Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gunakan kata sandi yang kuat dan unik untuk setiap akun.</li>
                <li>Aktifkan otentikasi dua faktor (2FA) jika tersedia.</li>
                <li>Waspada terhadap email atau pesan mencurigakan (phishing).</li>
                <li>Perbarui perangkat lunak dan sistem operasi secara teratur.</li>
                <li>Gunakan perangkat lunak antivirus dan firewall yang terpercaya.</li>
                <li>Hindari mengklik tautan atau mengunduh lampiran dari sumber yang tidak dikenal.</li>
                <li>Cadangkan data penting Anda secara teratur.</li>
                <li>Berhati-hati saat menggunakan Wi-Fi publik.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  )
}
