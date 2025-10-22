// Create Connect protocol frame: 5-byte header (flags + length) + payload
// First byte: flags (0x00 for uncompressed binary)
// Next 4 bytes: length of the payload in network byte order (big-endian)
export function createConnectFrame(jsonPayload, encoder): Uint8Array {
  const payloadBytes = encoder.encode(jsonPayload)

  const frame = new Uint8Array(5 + payloadBytes.length)
  frame[0] = 0 // flags byte (0 for uncompressed)
  // Set the 4-byte length in big-endian format
  const length = payloadBytes.length
  frame[1] = (length >> 24) & 0xff
  frame[2] = (length >> 16) & 0xff
  frame[3] = (length >> 8) & 0xff
  frame[4] = length & 0xff

  // Copy the payload data after the header
  frame.set(payloadBytes, 5)

  return frame
}
