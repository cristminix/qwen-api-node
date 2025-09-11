import { eq, and, sum } from "drizzle-orm"
import { db } from "../index"
import { usages, type NewUsage, type Usage } from "../schema"

/**
 * Mengupdate atau memasukkan record penggunaan API ke database berdasarkan tanggal
 * @param provider Nama provider
 * @param model Nama model
 * @param date Tanggal dalam format 2020-09-09
 * @param connections Jumlah koneksi
 * @param tokens Jumlah token
 * @returns Data usage yang disimpan
 */
export async function upsertUsage(
  provider: string,
  model: string,
  date: string,
  connections: number,
  tokens: number,
  ipaddr: string = ""
): Promise<Usage> {
  // Mengecek apakah sudah ada record dengan kombinasi provider, model, dan date tertentu
  const existingRecord: Usage | null = await getUsageByProviderModelDate(
    provider,
    model,
    date,
    ipaddr
  )

  if (existingRecord) {
    // Jika ada, mengupdate field connections, tokens, dan updatedAt
    const updatedUsage: Usage = await updateUsage(
      existingRecord.id,
      connections,
      tokens,
      ipaddr
    )
    return updatedUsage
  } else {
    // Jika tidak ada, memasukkan record baru
    const newUsage: Usage = await insertUsage(
      provider,
      model,
      date,
      connections,
      tokens,
      ipaddr
    )
    return newUsage
  }
}

/**
 * Memasukkan record penggunaan API baru ke database
 * @param provider Nama provider
 * @param model Nama model
 * @param date Tanggal dalam format 2020-09-09
 * @param connections Jumlah koneksi
 * @param tokens Jumlah token
 * @returns Data usage yang disimpan
 */
export async function insertUsage(
  provider: string,
  model: string,
  date: string,
  connections: number,
  tokens: number,
  ipaddr: string = ""
): Promise<Usage> {
  const newUsage: NewUsage = {
    provider,
    model,
    date,
    connections,
    tokens,
    ipaddr,
    updatedAt: new Date(),
  }

  const result: Usage[] = await db.insert(usages).values(newUsage).returning()
  return result[0]
}

/**
 * Mengupdate record penggunaan API di database
 * @param id ID record yang akan diupdate
 * @param connections Jumlah koneksi
 * @param tokens Jumlah token
 * @returns Data usage yang diperbarui
 */
export async function updateUsage(
  id: number,
  connections: number,
  tokens: number,
  ipaddr: string = ""
): Promise<Usage> {
  // Membuat objek dengan tipe yang sesuai untuk menghindari error TypeScript
  const up: Partial<Usage> = {
    connections: connections,
    tokens: tokens,
    updatedAt: new Date(),
  }

  // Menambahkan ipaddr ke objek update jika disediakan
  if (ipaddr.length > 0) up.ipaddr = ipaddr
  const result: Usage[] = await db
    .update(usages)
    .set(up)
    .where(eq(usages.id, id))
    .returning()
  return result[0]
}

/**
 * Mendapatkan record penggunaan API dari database berdasarkan provider, model, dan date
 * @param provider Nama provider
 * @param model Nama model
 * @param date Tanggal dalam format 2020-09-09
 * @returns Data usage jika ditemukan, null jika tidak
 */
export async function getUsageByProviderModelDate(
  provider: string,
  model: string,
  date: string,
  ipaddr: string = ""
): Promise<Usage | null> {
  // Membangun kondisi where berdasarkan parameter yang disediakan
  const conditions = [
    eq(usages.provider, provider),
    eq(usages.model, model),
    eq(usages.date, date),
  ]

  // Menambahkan kondisi ipaddr jika disediakan
  if (ipaddr) {
    conditions.push(eq(usages.ipaddr, ipaddr))
  }

  const result: Usage[] = await db
    .select()
    .from(usages)
    .where(and(...conditions))
  return result.length > 0 ? result[0] : null
}

/**
 * Mendapatkan semua record penggunaan API dari database
 * @returns Array dari data usage
 */
export async function getAllUsages(): Promise<Usage[]> {
  const result: Usage[] = await db.select().from(usages)
  return result
}

/**
 * Mendapatkan record penggunaan API dari database berdasarkan provider
 * @param provider Nama provider
 * @param ipaddr Alamat IP (opsional)
 * @returns Object dengan total connections dan tokens untuk hari ini
 */
export async function getUsagesByProvider(
  provider: string,
  ipaddr?: string
): Promise<{ connections: number; tokens: number } | null> {
  const currentDate = new Date().toISOString().split("T")[0]

  // Membangun kondisi where berdasarkan parameter yang disediakan
  const conditions = [
    eq(usages.provider, provider),
    eq(usages.date, currentDate),
  ]

  // Menambahkan kondisi ipaddr jika disediakan
  if (ipaddr) {
    conditions.push(eq(usages.ipaddr, ipaddr))
  }

  const result: { connections: number; tokens: number }[] = await db
    .select({
      connections: sum(usages.connections).mapWith(Number),
      tokens: sum(usages.tokens).mapWith(Number),
    })
    .from(usages)
    .where(and(...conditions))

  // Jika tidak ada data, kembalikan null
  if (
    result.length === 0 ||
    (result[0].connections === null && result[0].tokens === null)
  ) {
    return null
  }

  // Kembalikan object dengan nilai default 0 jika null
  return {
    connections: result[0].connections || 0,
    tokens: result[0].tokens || 0,
  }
}
