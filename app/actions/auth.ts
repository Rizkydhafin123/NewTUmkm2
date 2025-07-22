"use server"

import { userService } from "@/lib/db"
import type { RegisterData } from "@/lib/auth"

export async function registerUser(userData: RegisterData): Promise<{ success: boolean; message: string }> {
  return await userService.createUser(userData)
}
