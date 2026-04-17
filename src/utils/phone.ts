const digitsOnly = (value: string | undefined | null): string => (value ?? '').replace(/\D/g, '')

const stripPrefixes = (digits: string): string => {
  if (!digits) {
    return ''
  }

  if (digits.startsWith('00')) {
    return digits.slice(2)
  }

  return digits
}

export const normalizePhoneDigits = (value: string | undefined | null): string => {
  const stripped = stripPrefixes(digitsOnly(value))

  if (!stripped) {
    return ''
  }

  return stripped.replace(/^0+/, '')
}

export const toBrazilWhatsAppNumber = (value: string | undefined | null): string => {
  const digits = normalizePhoneDigits(value)

  if (!digits) {
    return ''
  }

  if (digits.startsWith('55')) {
    return digits
  }

  return `55${digits}`
}

export const resolveBrazilWhatsAppNumber = (candidates: Array<string | undefined | null>): string => {
  for (const candidate of candidates) {
    const normalized = toBrazilWhatsAppNumber(candidate)

    if (normalized) {
      return normalized
    }
  }

  return ''
}

export const formatBrazilPhoneDisplay = (value: string | undefined | null): string => {
  const normalized = toBrazilWhatsAppNumber(value)

  if (!normalized) {
    return ''
  }

  const localDigits = normalized.startsWith('55') ? normalized.slice(2) : normalized

  if (localDigits.length === 11) {
    return `+55 ${localDigits.slice(0, 2)} ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`
  }

  if (localDigits.length === 10) {
    return `+55 ${localDigits.slice(0, 2)} ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
  }

  return `+${normalized}`
}