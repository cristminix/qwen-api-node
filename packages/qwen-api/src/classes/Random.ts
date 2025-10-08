/**
 * Node.js equivalent of Python's random module
 * Provides random number generation and selection utilities
 */

export class Random {
  private seedValue: number

  constructor(seed?: number) {
    this.seedValue = seed || Date.now()
  }

  /**
   * Seed the random number generator
   */
  seed(seed: number): void {
    this.seedValue = seed
  }

  /**
   * Return a random float in the range [0.0, 1.0)
   */
  random(): number {
    // Simple pseudo-random generator
    this.seedValue = (this.seedValue * 9301 + 49297) % 233280
    return this.seedValue / 233280
  }

  /**
   * Return a random integer N such that a <= N <= b
   */
  randint(a: number, b: number): number {
    return Math.floor(this.random() * (b - a + 1)) + a
  }

  /**
   * Return a random integer from range(start, stop) or range(start, stop, step)
   */
  randrange(start: number, stop?: number, step: number = 1): number {
    if (stop === undefined) {
      stop = start
      start = 0
    }

    const range = stop - start
    const steps = Math.floor(range / step)
    return start + this.randint(0, steps) * step
  }

  /**
   * Choose a random element from a non-empty sequence
   */
  choice<T>(seq: T[]): T {
    if (seq.length === 0) {
      throw new Error("Cannot choose from an empty sequence")
    }
    return seq[this.randint(0, seq.length - 1)]
  }

  /**
   * Return a k sized list of elements chosen with replacement
   */
  choices<T>(population: T[], weights?: number[], k: number = 1): T[] {
    if (population.length === 0) {
      throw new Error("Cannot choose from an empty population")
    }

    const result: T[] = []

    if (weights) {
      if (weights.length !== population.length) {
        throw new Error("The number of weights does not match the population")
      }

      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      const cumulativeWeights: number[] = []
      let sum = 0

      for (const weight of weights) {
        sum += weight
        cumulativeWeights.push(sum)
      }

      for (let i = 0; i < k; i++) {
        const random = this.random() * totalWeight
        let index = 0

        while (
          index < cumulativeWeights.length &&
          random > cumulativeWeights[index]
        ) {
          index++
        }

        result.push(population[index])
      }
    } else {
      for (let i = 0; i < k; i++) {
        result.push(this.choice(population))
      }
    }

    return result
  }

  /**
   * Shuffle list x in place
   */
  shuffle<T>(x: T[]): void {
    for (let i = x.length - 1; i > 0; i--) {
      const j = this.randint(0, i)
      ;[x[i], x[j]] = [x[j], x[i]]
    }
  }

  /**
   * Return a k length list of unique elements chosen from the population sequence
   */
  sample<T>(population: T[], k: number): T[] {
    if (k < 0 || k > population.length) {
      throw new Error("Sample larger than population or is negative")
    }

    const result: T[] = []
    const indices = new Set<number>()

    while (result.length < k) {
      const index = this.randint(0, population.length - 1)
      if (!indices.has(index)) {
        indices.add(index)
        result.push(population[index])
      }
    }

    return result
  }

  /**
   * Get a random number in the range [a, b)
   */
  uniform(a: number, b: number): number {
    return a + (b - a) * this.random()
  }

  /**
   * Triangular distribution
   */
  triangular(low: number = 0.0, high: number = 1.0, mode?: number): number {
    const c = mode !== undefined ? (mode - low) / (high - low) : 0.5
    const u = this.random()

    if (u < c) {
      const modeValue = mode !== undefined ? mode : low + (high - low) / 2
      return low + Math.sqrt(u * (high - low) * (modeValue - low))
    } else {
      const modeValue = mode !== undefined ? mode : low + (high - low) / 2
      return high - Math.sqrt((1 - u) * (high - low) * (high - modeValue))
    }
  }

  /**
   * Normal distribution
   */
  gauss(mu: number = 0.0, sigma: number = 1.0): number {
    // Box-Muller transform
    let u = 0,
      v = 0
    while (u === 0) u = this.random()
    while (v === 0) v = this.random()

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return mu + z * sigma
  }

  /**
   * Log normal distribution
   */
  lognormvariate(mu: number, sigma: number): number {
    return Math.exp(this.gauss(mu, sigma))
  }

  /**
   * Exponential distribution
   */
  expovariate(lambd: number = 1.0): number {
    return -Math.log(1.0 - this.random()) / lambd
  }

  /**
   * Gamma distribution
   */
  gammavariate(alpha: number, beta: number): number {
    if (alpha <= 0.0 || beta <= 0.0) {
      throw new Error("gammavariate: alpha and beta must be > 0.0")
    }

    if (alpha > 1.0) {
      // Marsaglia and Tsang method
      const d = alpha - 1.0 / 3.0
      const c = 1.0 / Math.sqrt(9.0 * d)

      while (true) {
        let x, v
        do {
          x = this.gauss(0, 1)
          v = 1.0 + c * x
        } while (v <= 0.0)

        v = v * v * v
        const u = this.random()

        if (u < 1.0 - 0.0331 * x * x * x * x) {
          return d * v * beta
        }

        if (Math.log(u) < 0.5 * x * x + d * (1.0 - v + Math.log(v))) {
          return d * v * beta
        }
      }
    } else if (alpha === 1.0) {
      return -Math.log(1.0 - this.random()) * beta
    } else {
      // Ahrens-Dieter acceptance-rejection method
      while (true) {
        const u = this.random()
        const b = (Math.E + alpha) / Math.E
        const p = b * u

        let x
        if (p <= 1.0) {
          x = Math.pow(p, 1.0 / alpha)
        } else {
          x = -Math.log((b - p) / alpha)
        }

        const u1 = this.random()
        if (p > 1.0) {
          if (u1 <= Math.pow(x, alpha - 1.0)) {
            return x * beta
          }
        } else if (u1 <= Math.exp(-x)) {
          return x * beta
        }
      }
    }
  }

  /**
   * Beta distribution
   */
  betavariate(alpha: number, beta: number): number {
    const y = this.gammavariate(alpha, 1.0)
    if (y === 0) return 0.0
    return y / (y + this.gammavariate(beta, 1.0))
  }

  /**
   * Pareto distribution
   */
  paretovariate(alpha: number): number {
    const u = 1.0 - this.random()
    return Math.pow(u, -1.0 / alpha)
  }

  /**
   * Weibull distribution
   */
  weibullvariate(alpha: number, beta: number): number {
    const u = 1.0 - this.random()
    return alpha * Math.pow(-Math.log(u), 1.0 / beta)
  }

  /**
   * Binomial distribution
   */
  binomialvariate(n: number = 1, p: number = 0.5): number {
    if (n < 0) {
      throw new Error("n must be non-negative")
    }

    if (p <= 0.0) return 0
    if (p >= 1.0) return n

    let successes = 0
    for (let i = 0; i < n; i++) {
      if (this.random() < p) {
        successes++
      }
    }

    return successes
  }

  /**
   * Generate n random bytes
   */
  randbytes(n: number): Buffer {
    const bytes = Buffer.alloc(n)
    for (let i = 0; i < n; i++) {
      bytes[i] = this.randint(0, 255)
    }
    return bytes
  }

  /**
   * Get the next random number in the range [0.0, 1.0) using crypto module
   */
  static secureRandom(): number {
    const crypto = require("crypto")
    const buffer = crypto.randomBytes(4)
    return buffer.readUInt32BE(0) / 0xffffffff
  }

  /**
   * Generate a cryptographically secure random integer between min and max (inclusive)
   */
  static secureInt(min: number, max: number): number {
    const range = max - min + 1
    const crypto = require("crypto")
    const bytesNeeded = Math.ceil(Math.log2(range) / 8)
    const maxValue = Math.pow(256, bytesNeeded)
    const threshold = maxValue - (maxValue % range)

    let randomValue
    do {
      randomValue = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded)
    } while (randomValue >= threshold)

    return min + (randomValue % range)
  }
}

// Create a default instance
const defaultRandom = new Random()

// Export module-level functions
export const random = () => defaultRandom.random()
export const seed = (seed: number) => defaultRandom.seed(seed)
export const randint = (a: number, b: number) => defaultRandom.randint(a, b)
export const randrange = (start: number, stop?: number, step?: number) =>
  defaultRandom.randrange(start, stop, step)
export const choice = <T>(seq: T[]) => defaultRandom.choice(seq)
export const choices = <T>(population: T[], weights?: number[], k?: number) =>
  defaultRandom.choices(population, weights, k)
export const shuffle = <T>(x: T[]) => defaultRandom.shuffle(x)
export const sample = <T>(population: T[], k: number) =>
  defaultRandom.sample(population, k)
export const uniform = (a: number, b: number) => defaultRandom.uniform(a, b)
export const triangular = (low?: number, high?: number, mode?: number) =>
  defaultRandom.triangular(low, high, mode)
export const gauss = (mu?: number, sigma?: number) =>
  defaultRandom.gauss(mu, sigma)
export const lognormvariate = (mu: number, sigma: number) =>
  defaultRandom.lognormvariate(mu, sigma)
export const expovariate = (lambd?: number) => defaultRandom.expovariate(lambd)
export const gammavariate = (alpha: number, beta: number) =>
  defaultRandom.gammavariate(alpha, beta)
export const betavariate = (alpha: number, beta: number) =>
  defaultRandom.betavariate(alpha, beta)
export const paretovariate = (alpha: number) =>
  defaultRandom.paretovariate(alpha)
export const weibullvariate = (alpha: number, beta: number) =>
  defaultRandom.weibullvariate(alpha, beta)
export const binomialvariate = (n?: number, p?: number) =>
  defaultRandom.binomialvariate(n, p)
export const randbytes = (n: number) => defaultRandom.randbytes(n)
export const secureRandom = Random.secureRandom
export const secureInt = Random.secureInt
