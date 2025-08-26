import { Client } from "./Client"
import { PollinationsAI } from "./providers/PollinationsAI"
import { Custom } from "./providers/Custom"
import { DeepInfra } from "./providers/DeepInfra"
import { Together } from "./providers/Together"
import { Puter } from "./providers/Puter"
import { HuggingFace } from "./providers/HuggingFace"

/**
 * Manages a list of CORS proxies with failover capabilities.
 */
class CorsProxyManager {
  public proxies: string[]
  private currentIndex: number
  private useProxyRotation: boolean = false

  /**
   * @param {string[]} proxies - An array of CORS proxy base URLs.
   * @param {boolean} useProxyRotation - Whether to use proxy rotation (default: true).
   */
  constructor(
    proxies: string[] = [
      // "https://corsproxy.io/?",
      // "https://api.allorigins.win/raw?url=",
      "https://cloudflare-cors-anywhere.queakchannel42.workers.dev/?",
      // "https://proxy.cors.sh/",
      // "https://cors-anywhere.herokuapp.com/",
      // "https://thingproxy.freeboard.io/fetch/",
      // "https://cors.bridged.cc/",
      // "https://cors-proxy.htmldriven.com/?url=",
      // "https://yacdn.org/proxy/",
      // "https://api.codetabs.com/v1/proxy?quest=",
    ],
    useProxyRotation: boolean = false
  ) {
    if (!Array.isArray(proxies) || proxies.length === 0) {
      throw new Error(
        "CorsProxyManager requires a non-empty array of proxy URLs."
      )
    }
    this.proxies = proxies
    this.currentIndex = 0
    this.useProxyRotation = useProxyRotation
  }

  /**
   * Gets the full proxied URL for the current proxy.
   * @param {string} targetUrl - The URL to be proxied.
   * @returns {string} The full proxied URL.
   */
  getProxiedUrl(targetUrl: string): string {
    if (this.useProxyRotation) {
      const proxy = this.proxies[this.currentIndex]
      return proxy + encodeURIComponent(targetUrl)
    } else {
      // When not using proxy rotation, use the first proxy or direct connection
      // For direct connection, we could return targetUrl directly, but for consistency
      // with the proxy interface, we'll still use the first proxy
      const proxy = this.proxies[0]
      return proxy + encodeURIComponent(targetUrl)
    }
  }

  /**
   * Rotates to the next proxy in the list.
   */
  rotateProxy(): void {
    if (this.useProxyRotation) {
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length
      console.warn(
        `Rotated to next CORS proxy: ${this.proxies[this.currentIndex]}`
      )
    } else {
      // When not using proxy rotation, do nothing
      console.debug("Proxy rotation is disabled.")
    }
  }
}

export {
  Client,
  CorsProxyManager,
  Custom,
  PollinationsAI,
  DeepInfra,
  Together,
  Puter,
  HuggingFace,
}
