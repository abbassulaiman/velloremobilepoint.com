/**
 * Composable for generating QR code data URLs from inventory item IDs.
 * Uses the `qrcode` npm package (client-side, no backend call needed).
 *
 * Usage:
 *   const { generateQrDataUrl } = useQrCode()
 *   const dataUrl = await generateQrDataUrl(item.id)
 */
export function useQrCode() {
  /**
   * Build the scan URL for a given inventory item ID.
   * Points to /admin/inventory/scan?id=<id> on the current host.
   */
  function buildScanUrl(itemId: number | string): string {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/admin/inventory/scan?id=${itemId}`
  }

  /**
   * Generate a QR code as a PNG data URL for the given inventory item ID.
   * Returns an empty string if called server-side.
   */
  async function generateQrDataUrl(itemId: number | string, size = 160): Promise<string> {
    if (typeof window === 'undefined') return ''
    const QRCode = (await import('qrcode')).default
    return QRCode.toDataURL(buildScanUrl(itemId), {
      width: size,
      margin: 1,
      color: { dark: '#111111', light: '#ffffff' },
    })
  }

  /**
   * Generate QR codes for multiple items at once.
   * Returns a map of itemId → data URL.
   */
  async function generateQrBatch(
    items: Array<{ id: number | string }>,
    size = 160,
  ): Promise<Record<string, string>> {
    const entries = await Promise.all(
      items.map(async (item) => [String(item.id), await generateQrDataUrl(item.id, size)] as const),
    )
    return Object.fromEntries(entries)
  }

  return { buildScanUrl, generateQrDataUrl, generateQrBatch }
}
