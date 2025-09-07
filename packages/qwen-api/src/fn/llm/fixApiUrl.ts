import { load } from "cheerio"
import TurndownService from "turndown"

const turndown = new TurndownService()

function addBaseUrl(url) {
  if (!url) return url
  if (url.startsWith("/media") || url.startsWith("/thumbnail")) {
    return `${process.env.GPT4FREE_BASE_URL || "http://localhost:7000"}${url}`
  }
  return url
}
function processHtmlAttributes(htmlText: string): [boolean, string] {
  // Hanya memproses tag img, a, video, dan audio
  let processedHtml = htmlText
  let matchFound = false

  // Proses atribut src untuk tag img
  processedHtml = processedHtml.replace(
    /<img([^>]*?)src=(['"])(.*?)\2/gi,
    (match, before, quote, src) => {
      matchFound = true
      const newSrc = addBaseUrl(src)
      return `<img${before}src=${quote}${newSrc}${quote}`
    }
  )

  // Proses atribut href untuk tag a
  processedHtml = processedHtml.replace(
    /<a([^>]*?)href=(['"])(.*?)\2/gi,
    (match, before, quote, href) => {
      matchFound = true
      const newHref = addBaseUrl(href)
      return `<a${before}href=${quote}${newHref}${quote}`
    }
  )

  // Proses atribut src untuk tag video
  processedHtml = processedHtml.replace(
    /<video([^>]*?)src=(['"])(.*?)\2/gi,
    (match, before, quote, src) => {
      matchFound = true
      const newSrc = addBaseUrl(src)
      // Tambahkan atribut controls jika belum ada
      const controlsAttr = before.includes("controls") ? "" : " controls"
      return `<video${before}${controlsAttr} src=${quote}${newSrc}${quote}`
    }
  )

  // Proses atribut src untuk tag audio
  processedHtml = processedHtml.replace(
    /<audio([^>]*?)src=(['"])(.*?)\2/gi,
    (match, before, quote, src) => {
      matchFound = true
      const newSrc = addBaseUrl(src)
      return `<audio${before}src=${quote}${newSrc}${quote}`
    }
  )

  return [matchFound, processedHtml]
}
export function fixApiUrl(content: string) {
  let [matchFound, newContent] = processHtmlAttributes(content)

  if (matchFound) {
    const $ = load(newContent)
    // convert html to markdown using turndown
    newContent = turndown.turndown($("body").html())
  }

  return newContent
}
