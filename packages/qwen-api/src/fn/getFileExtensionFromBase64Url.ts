/**
 * Mendapatkan ekstensi file dari URL base64.
 *
 * @param {string} base64Url - URL base64 yang akan diekstrak ekstensi filenya.
 * @returns {string} Ekstensi file (misalnya, 'png', 'jpg', dll.) atau string kosong jika tidak ditemukan.
 */
export function getFileExtensionFromBase64Url(base64Url: string) {
  // Mencari indeks karakter ':' setelah "data"
  const colonIndex = base64Url.indexOf(":")

  // Jika tidak ditemukan, kembalikan string kosong
  if (colonIndex === -1) {
    return ""
  }

  // Mencari indeks karakter '/' setelah ':'
  const slashIndex = base64Url.indexOf("/", colonIndex)

  // Jika tidak ditemukan, kembalikan string kosong
  if (slashIndex === -1) {
    return ""
  }

  // Mencari indeks karakter ';' setelah '/'
  const semicolonIndex = base64Url.indexOf(";", slashIndex)

  // Jika tidak ditemukan, kembalikan string kosong
  if (semicolonIndex === -1) {
    return ""
  }

  // Mengambil substring antara '/' dan ';'
  const extension = base64Url.substring(slashIndex + 1, semicolonIndex)

  return extension
}
