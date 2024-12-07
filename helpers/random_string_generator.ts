export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function generateUniqueClientId(length: number, generatedClientIds: Set<string>): string {
  let clientId
  do {
    clientId = generateRandomString(length)
  } while (generatedClientIds.has(clientId))
  generatedClientIds.add(clientId)
  return clientId
}
