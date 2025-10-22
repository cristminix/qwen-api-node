export function getAuthInfo(token: string) {
  const [conf, info] = token.split(".")
  const json_str = atob(info)

  try {
    return JSON.parse(json_str)
  } catch (error) {}
  return null
}
