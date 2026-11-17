export class LevenshteinHelper {
  static similarityPercentage(a: string, b: string): number {
    if (!a || !b) return 0
    const strA = a.toLowerCase().trim()
    const strB = b.toLowerCase().trim()
    if (strA === strB) return 100

    const distance = this.levenshteinDistance(strA, strB)
    const maxLength = Math.max(strA.length, strB.length)
    if (maxLength === 0) return 100
    return Math.round(((maxLength - distance) / maxLength) * 100)
  }

  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = []
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          )
        }
      }
    }
    return matrix[b.length][a.length]
  }
}
