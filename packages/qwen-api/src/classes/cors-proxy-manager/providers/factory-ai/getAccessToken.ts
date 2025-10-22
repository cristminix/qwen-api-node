import nock from "nock"

interface User {
  object: string
  id: string
  email: string
  email_verified: boolean
  first_name: string
  last_name: string
  profile_picture_url: string | null
  last_sign_in_at: string
  locale: string
  created_at: string
  updated_at: string
  external_id: string | null
}

interface TokenResponse {
  user: User
  organization_id: string
  access_token: string
  refresh_token: string
  authentication_method: string
}

export async function getAccessToken(
  refreshToken: string,
  clientId: string = "client_01HNM792M5G5G1A2THWPXKFMXB"
): Promise<TokenResponse> {
  const url = "https://api.workos.com/user_management/authenticate"

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  })
  console.log({ body })
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Bun/1.2.23",
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
  clientId: string = "client_01HNM792M5G5G1A2THWPXKFMXB"
): Promise<TokenResponse> {
  // Mock response data
  const mockResponse: TokenResponse = {
    user: {
      object: "user",
      id: "user_01HNM792M5G5G1A2THWPXKFMXB",
      email: "test@example.com",
      email_verified: true,
      first_name: "Test",
      last_name: "User",
      profile_picture_url: null,
      last_sign_in_at: "2023-10-09T23:42:13.256Z",
      locale: "en",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-10-09T23:42:13.256Z",
      external_id: null,
    },
    organization_id: "org_01HNM792M5G5G1A2THWPXKFMXB",
    access_token: "mock_access_token_12345",
    refresh_token: "mock_refresh_token_67890",
    authentication_method: "refresh_token",
  }

  // Set up the nock interceptor
  const scope = nock("https://api.workos.com")
    .post("/user_management/authenticate")
    .reply(200, mockResponse)

  const url = "https://api.workos.com/user_management/authenticate"

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

    // Verify that the nock interceptor was used
    if (!scope.isDone()) {
      throw new Error("Mock endpoint was not called")
    }

    return data
  } catch (error) {
    console.error("Error getting access token:", error)
    throw error
  }
}
