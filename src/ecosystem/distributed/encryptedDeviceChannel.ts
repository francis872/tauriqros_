export interface EncryptedChannel {
  id: string
  cipher: 'xchacha20-poly1305'
  established: boolean
}

export function establishEncryptedDeviceChannel(peerId: string): EncryptedChannel {
  return {
    id: `channel-${peerId}`,
    cipher: 'xchacha20-poly1305',
    established: true,
  }
}
