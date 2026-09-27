/** Human-readable sentences for the history log. */
export function describeEntry(entry) {
  const name = (entry.teamName ?? entry.team?.name ?? '').trim() || 'Tim tanpa nama'
  switch (entry.type) {
    case 'score':
      return `${name}: ${entry.amount >= 0 ? '+' : ''}${entry.amount} (${entry.prevScore} → ${entry.nextScore})`
    case 'add':
      return `Menambah ${(entry.team?.name ?? '').trim() || 'tim baru'}`
    case 'remove':
      return `Menghapus ${name} (${entry.team?.score ?? 0} poin)`
    case 'reset':
      return `Menghapus ${(entry.teams ?? []).length} tim`
    default:
      return 'Mengubah papan skor'
  }
}

export function formatEntryTime(at) {
  try {
    return new Date(at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return ''
  }
}
