const normalize = (value) => String(value || '').trim().toLowerCase()

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => normalize(item))
    .filter(Boolean)

const adminEmails = parseList(import.meta.env.VITE_ADMIN_EMAILS)

export const getUserRole = (user) => {
  const metadataRole = normalize(user?.publicMetadata?.role)
  if (metadataRole === 'admin' || metadataRole === 'instructor' || metadataRole === 'student') {
    return metadataRole
  }

  const email = normalize(user?.primaryEmailAddress?.emailAddress)
  if (email && adminEmails.includes(email)) {
    return 'admin'
  }

  return 'student'
}
