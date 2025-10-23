export function getAuthInfo(token: string) {
  

  try {
    const [conf, info] = token.split(".")
  // console.log({token,info})
  const json_str = atob(info)
    return JSON.parse(json_str)
  } catch (error) {}
  return null
}
