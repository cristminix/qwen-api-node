/**
 * Mendapatkan ekstensi file dari URL base64.
 *
 * @param {string} base64Url - URL base64 yang akan diekstrak ekstensi filenya.
 * @returns {string} Ekstensi file (misalnya, 'png', 'jpg', dll.) atau string kosong jika tidak ditemukan.
 */
export function getFileExtensionFromBase64Url(base64Url: string) {
  // Mencari indeks karakter ';' setelah "data:"
  const startIndex = base64Url.indexOf(";")

  // Jika tidak ditemukan, kembalikan string kosong
  if (startIndex === -1) {
    return ""
  }

  // Mencari indeks karakter '/' setelah ';'
  const slashIndex = base64Url.indexOf("/", startIndex)

  // Jika tidak ditemukan, kembalikan string kosong
  if (slashIndex === -1) {
    return ""
  }

  // Mengambil substring setelah '/' hingga karakter ','
  const extension = base64Url.substring(
    slashIndex + 1,
    base64Url.indexOf(",", slashIndex)
  )

  return extension
}
