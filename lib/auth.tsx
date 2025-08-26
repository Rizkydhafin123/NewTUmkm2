"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { neon } from "@neondatabase/serverless"
import { hasNeon } from "@/lib/db"

export interface User {
  id: string
  username: string
  name: string
  role: "admin" | "user"
  rw?: string
  created_at?: string
  must_change_password?: boolean
  last_password_change?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  isLoading: boolean
}

export interface RegisterData {
  username: string
  password: string
  name: string
  rw: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fixed UUIDs untuk admin users
const ADMIN_USERS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    username: "admin",
    name: "Ketua RW 01",
    role: "admin" as const,
    rw: "01",
    created_at: "2024-01-01T00:00:00Z",
    must_change_password: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    username: "admin",
    name: "Ketua RW 04",
    role: "admin" as const,
    rw: "04",
    created_at: "2024-01-01T00:00:00Z",
    must_change_password: true,
  },
]

const DEFAULT_ADMIN_PASSWORD = "admin"

// Generate UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Hash password yang konsisten cross-browser
function hashPassword(password: string): string {
  // Menggunakan btoa yang konsisten di semua browser
  const saltedPassword = password + "UMKM_SALT_2024_RT_RW"
  return btoa(saltedPassword)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 32)
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Cek session di localStorage
      const currentUser = localStorage.getItem("auth_user")
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)

          // Validasi session dengan database jika online
          if (hasNeon && userData.role !== "admin") {
            const sql = neon(process.env.DATABASE_URL!)
            const users = await sql`
              SELECT id, username, name, role, rw, created_at 
              FROM users 
              WHERE id = ${userData.id}
            `

            if (users.length > 0) {
              // Session valid, update data dari database
              const dbUser = users[0]
              const validatedUser = {
                id: dbUser.id,
                username: dbUser.username,
                name: dbUser.name,
                role: dbUser.role,
                rw: dbUser.rw,
                created_at: dbUser.created_at,
              }
              setUser(validatedUser)
              localStorage.setItem("auth_user", JSON.stringify(validatedUser))
            } else {
              // User tidak ada di database, hapus session
              localStorage.removeItem("auth_user")
            }
          } else {
            // Admin atau offline mode
            setUser(userData)
          }
        } catch (error) {
          console.error("Session validation error:", error)
          localStorage.removeItem("auth_user")
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Login attempt:", username, hasNeon ? "(Online)" : "(Offline)")

      // Cek admin login dulu
      if (username === "admin") {
        if (password === DEFAULT_ADMIN_PASSWORD) {
          const rwChoice = prompt("Pilih RW Anda:\n1. RW 01\n2. RW 04\n\nMasukkan nomor pilihan (1 atau 2):")

          let selectedRW = ""
          if (rwChoice === "1") {
            selectedRW = "01"
          } else if (rwChoice === "2") {
            selectedRW = "04"
          } else {
            alert("Pilihan tidak valid. Pilih 1 untuk RW 01 atau 2 untuk RW 04.")
            return false
          }

          const adminUser = ADMIN_USERS.find((admin) => admin.rw === selectedRW)
          if (adminUser) {
            // Cek apakah password sudah diganti
            if (hasNeon) {
              const sql = neon(process.env.DATABASE_URL!)
              const adminPasswords = await sql`
                SELECT password_hash FROM admin_passwords WHERE admin_id = ${adminUser.id}
              `

              if (adminPasswords.length > 0) {
                alert("Password default sudah diganti. Gunakan password baru Anda.")
                return false
              }
            } else {
              const adminPasswords = JSON.parse(localStorage.getItem("admin_passwords") || "{}")
              if (adminPasswords[adminUser.id]) {
                alert("Password default sudah diganti. Gunakan password baru Anda.")
                return false
              }
            }

            console.log("✅ Admin login successful:", adminUser.rw)
            setUser(adminUser)
            localStorage.setItem("auth_user", JSON.stringify(adminUser))
            return true
          }
        } else {
          // Cek custom password untuk admin
          if (hasNeon) {
            const sql = neon(process.env.DATABASE_URL!)
            for (const admin of ADMIN_USERS) {
              const adminPasswords = await sql`
                SELECT password_hash FROM admin_passwords WHERE admin_id = ${admin.id}
              `

              if (adminPasswords.length > 0 && verifyPassword(password, adminPasswords[0].password_hash)) {
                const updatedAdmin = { ...admin, must_change_password: false }
                console.log("✅ Admin custom password login successful:", admin.rw)
                setUser(updatedAdmin)
                localStorage.setItem("auth_user", JSON.stringify(updatedAdmin))
                return true
              }
            }
          } else {
            const adminPasswords = JSON.parse(localStorage.getItem("admin_passwords") || "{}")
            for (const admin of ADMIN_USERS) {
              const customPassword = adminPasswords[admin.id]
              if (customPassword && password === customPassword) {
                const updatedAdmin = { ...admin, must_change_password: false }
                console.log("✅ Admin localStorage login successful:", admin.rw)
                setUser(updatedAdmin)
                localStorage.setItem("auth_user", JSON.stringify(updatedAdmin))
                return true
              }
            }
          }
        }
      }

      // Login untuk user biasa - PRIORITAS DATABASE
      if (hasNeon) {
        console.log("🔍 Checking database for user:", username)
        const sql = neon(process.env.DATABASE_URL!)

        // Cari user di database
        const users = await sql`
          SELECT id, username, name, role, rw, password_hash, created_at 
          FROM users 
          WHERE username = ${username} AND role = 'user'
        `

        console.log("📊 Database query result:", users.length, "users found")

        if (users.length > 0) {
          const dbUser = users[0]
          console.log("🔐 Verifying password for user:", dbUser.username)

          // Verify password
          if (dbUser.password_hash && verifyPassword(password, dbUser.password_hash)) {
            const userWithoutPassword = {
              id: dbUser.id,
              username: dbUser.username,
              name: dbUser.name,
              role: dbUser.role,
              rw: dbUser.rw,
              created_at: dbUser.created_at,
            }

            console.log("✅ Database login successful for:", userWithoutPassword.username)
            setUser(userWithoutPassword)
            localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword))
            return true
          } else {
            console.log("❌ Password verification failed")
          }
        } else {
          console.log("❌ User not found in database")
        }
      } else {
        console.log("📱 Using localStorage fallback")
        // Fallback ke localStorage jika database tidak tersedia
        const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
        const foundUser = users.find((u: any) => u.username === username && u.password === password)

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser
          console.log("✅ localStorage login successful:", userWithoutPassword.username)
          setUser(userWithoutPassword)
          localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword))
          return true
        }
      }

      console.log("❌ Login failed for:", username)
      return false
    } catch (error) {
      console.error("❌ Login error:", error)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("📝 Registration attempt:", userData.username, hasNeon ? "(Online)" : "(Offline)")

      if (userData.username === "admin") {
        return { success: false, message: "Username tidak tersedia" }
      }

      if (hasNeon) {
        const sql = neon(process.env.DATABASE_URL!)

        // Cek apakah username sudah ada
        const existingUsers = await sql`
          SELECT id FROM users WHERE username = ${userData.username}
        `

        if (existingUsers.length > 0) {
          console.log("❌ Username already exists:", userData.username)
          return { success: false, message: "Username sudah digunakan" }
        }

        // Insert user baru ke database
        const hashedPassword = hashPassword(userData.password)
        const userId = generateUUID()

        console.log("💾 Inserting user to database:", userData.username)

        await sql`
          INSERT INTO users (id, username, name, role, rw, password_hash, created_at)
          VALUES (
            ${userId},
            ${userData.username},
            ${userData.name},
            'user',
            ${userData.rw},
            ${hashedPassword},
            NOW()
          )
        `

        console.log("✅ User registered successfully in database:", userData.username)
        return { success: true, message: "Registrasi berhasil! Silakan login dengan akun Anda." }
      } else {
        console.log("📱 Using localStorage for registration")
        // Fallback ke localStorage
        const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
        const existingUser = users.find((u: any) => u.username === userData.username)

        if (existingUser) {
          return { success: false, message: "Username sudah digunakan" }
        }

        const newUser = {
          id: generateUUID(),
          username: userData.username,
          password: userData.password,
          name: userData.name,
          role: "user" as const,
          rw: userData.rw,
          created_at: new Date().toISOString(),
        }

        users.push(newUser)
        localStorage.setItem("registered_users", JSON.stringify(users))
        console.log("✅ User registered successfully in localStorage:", userData.username)
        return { success: true, message: "Registrasi berhasil! Silakan login." }
      }
    } catch (error) {
      console.error("❌ Registration error:", error)
      return { success: false, message: "Terjadi kesalahan saat registrasi" }
    }
  }

  const logout = () => {
    console.log("🚪 User logout")
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: "User tidak ditemukan" }
    }

    try {
      if (user.role === "admin") {
        if (hasNeon) {
          const sql = neon(process.env.DATABASE_URL!)

          // Cek password lama
          const adminPasswords = await sql`
            SELECT password_hash FROM admin_passwords WHERE admin_id = ${user.id}
          `

          const currentPassword =
            adminPasswords.length > 0 ? adminPasswords[0].password_hash : hashPassword(DEFAULT_ADMIN_PASSWORD)

          if (!verifyPassword(oldPassword, currentPassword)) {
            return { success: false, message: "Password lama tidak benar" }
          }

          if (newPassword.length < 6) {
            return { success: false, message: "Password baru minimal 6 karakter" }
          }

          if (oldPassword === newPassword) {
            return { success: false, message: "Password baru harus berbeda dari password lama" }
          }

          // Update password di database
          const hashedNewPassword = hashPassword(newPassword)

          await sql`
            INSERT INTO admin_passwords (admin_id, password_hash, updated_at)
            VALUES (${user.id}, ${hashedNewPassword}, NOW())
            ON CONFLICT (admin_id) 
            DO UPDATE SET password_hash = ${hashedNewPassword}, updated_at = NOW()
          `

          const updatedUser = {
            ...user,
            must_change_password: false,
            last_password_change: new Date().toISOString(),
          }
          setUser(updatedUser)
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))

          return { success: true, message: "Password berhasil diubah" }
        } else {
          // Fallback localStorage untuk admin
          const adminPasswords = JSON.parse(localStorage.getItem("admin_passwords") || "{}")
          const currentPassword = adminPasswords[user.id] || DEFAULT_ADMIN_PASSWORD

          if (oldPassword !== currentPassword) {
            return { success: false, message: "Password lama tidak benar" }
          }

          if (newPassword.length < 6) {
            return { success: false, message: "Password baru minimal 6 karakter" }
          }

          if (oldPassword === newPassword) {
            return { success: false, message: "Password baru harus berbeda dari password lama" }
          }

          adminPasswords[user.id] = newPassword
          localStorage.setItem("admin_passwords", JSON.stringify(adminPasswords))

          const updatedUser = {
            ...user,
            must_change_password: false,
            last_password_change: new Date().toISOString(),
          }
          setUser(updatedUser)
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))

          return { success: true, message: "Password berhasil diubah" }
        }
      } else {
        // User biasa
        if (hasNeon) {
          const sql = neon(process.env.DATABASE_URL!)

          // Cek password lama
          const users = await sql`
            SELECT password_hash FROM users WHERE id = ${user.id}
          `

          if (users.length === 0) {
            return { success: false, message: "User tidak ditemukan" }
          }

          if (!verifyPassword(oldPassword, users[0].password_hash)) {
            return { success: false, message: "Password lama tidak benar" }
          }

          if (newPassword.length < 6) {
            return { success: false, message: "Password baru minimal 6 karakter" }
          }

          if (oldPassword === newPassword) {
            return { success: false, message: "Password baru harus berbeda dari password lama" }
          }

          // Update password
          const hashedNewPassword = hashPassword(newPassword)

          await sql`
            UPDATE users 
            SET password_hash = ${hashedNewPassword}, updated_at = NOW()
            WHERE id = ${user.id}
          `

          return { success: true, message: "Password berhasil diubah" }
        } else {
          // Fallback localStorage untuk user
          const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
          const userIndex = users.findIndex((u: any) => u.id === user.id)

          if (userIndex === -1) {
            return { success: false, message: "User tidak ditemukan" }
          }

          if (oldPassword !== users[userIndex].password) {
            return { success: false, message: "Password lama tidak benar" }
          }

          if (newPassword.length < 6) {
            return { success: false, message: "Password baru minimal 6 karakter" }
          }

          if (oldPassword === newPassword) {
            return { success: false, message: "Password baru harus berbeda dari password lama" }
          }

          users[userIndex].password = newPassword
          users[userIndex].last_password_change = new Date().toISOString()
          localStorage.setItem("registered_users", JSON.stringify(users))

          return { success: true, message: "Password berhasil diubah" }
        }
      }
    } catch (error) {
      console.error("Change password error:", error)
      return { success: false, message: "Terjadi kesalahan saat mengubah password" }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
