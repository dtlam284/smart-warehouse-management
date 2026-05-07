export const isActivationRequiredMessage = (message?: string): boolean => {
  if (!message) {
    return false
  }

  const normalizedMessage = message.toLowerCase()

  return (
    normalizedMessage.includes('not activated') ||
    normalizedMessage.includes('not confirmed') ||
    normalizedMessage.includes('not verified') ||
    normalizedMessage.includes('account is inactive') ||
    normalizedMessage.includes('chưa kích hoạt') ||
    normalizedMessage.includes('chua kich hoat') ||
    normalizedMessage.includes('chưa xác thực') ||
    normalizedMessage.includes('chua xac thuc')
  )
}

export const isEmailUsername = (username: string): boolean => {
    return username.includes('@')
}

export const maskAuthTarget = (username: string): string => {
    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
        return ''
    }

    if (isEmailUsername(normalizedUsername)) {
        const [name = '', domain = ''] = normalizedUsername.split('@')
        const firstCharacter = name.charAt(0)

        return `${firstCharacter || '*'}***@${domain}`
    }

    const lastDigits = normalizedUsername.slice(-3)

    return `${normalizedUsername.slice(0, 3)} *** ***${lastDigits}`
}

export const sanitizeOtp = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 6)
}
