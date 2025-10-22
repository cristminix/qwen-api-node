import nock from "nock"

interface TokenResponse {
  status: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  scope: string
  resource_url: string
}

export async function getAccessToken(
  refreshToken: string,
  clientId: string = "f0304373b74a44d2b584a3fb70ca9e56"
): Promise<TokenResponse> {
  const url = "https://chat.qwen.ai/api/v1/oauth2/token"

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  })

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TokenResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error getting access token:", error)
    throw error
  }
}

export async function getAccessTokenMock(
  refreshToken: string,
  clientId: string = "f0304373b74a44d2b584a3fb70ca9e56"
): Promise<TokenResponse> {
  const scope = nock("https://chat.qwen.ai")
    .post("/api/v1/oauth2/token")
    .reply(200, {
      status: "success",
      access_token: "mock_access_token_12345",
      refresh_token: "mock_refresh_token_67890",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "read write",
      resource_url: "https://chat.qwen.ai/api",
    })

  const url = "https://chat.qwen.ai/api/v1/oauth2/token"

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  })

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TokenResponse = await response.json()
    scope.done()
    return data
  } catch (error) {
    console.error("Error getting access token:", error)
    throw error
  }
}
