function buildHeaders(): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9,id;q=0.8",
    "content-type": "application/json",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    cookie:
      "sessionId=4b8589ae-2d91-4b63-89a3-060446e0d7e5; render_app_version_affinity=dep-d2dtm63ipnbc73an8el0; __Host-authjs.csrf-token=9807ff33cda73e36aa3b0f43036915ff0c28f04120359ce750b7205890ba14bd%7C265418b57ff347ee55a17bec65f31d047c3a3db4195420e091d330290595e40b; intercom-id-x55eda6t=a8117fdb-37a6-45a1-986f-51d3feacb5eb; intercom-device-id-x55eda6t=da4b875f-5a85-4add-9698-e7ef6b5df983; __Secure-authjs.callback-url=https%3A%2F%2Fwww.blackbox.ai%2F; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..T291cHgBk82Opu1X.T4QQiNGPU7UmdrWARMdylLO5kdt0pNyQ_H9nA9DqcERGRq1kXgAK6X-Ekb_OShX1wL9vj0GbxsGo4Iq1RI2JU162pTYCbSRk5DH0l-bCYLawXM5GAcvcEsbiWnkOReyYCPPSMc9sgYqrHVVDSE8zFHogh7sHYPEABxuIxecmrDLdOia9neHPTcNtfCzIDNoSgf5asOSkZQSngXPYlTOjX5023uk38UIwaytYN8FJdxGEdjzgFuKPPfgNtakmNUThf7L0oNpqeVv2OzP-PR9w8cqVJIC0KlOEI3FuQ70ysau29kxp7-Veec3gX3_YAuzvtJ8kVGDbqLHQMuUnIHW4yCZ4_JdaybluVGTh78xtl8OuASJl5O2LuC2ETbHau52IMWMPKNkwZoRKRGoJdTv6eXUg6RPwAPIZUu8b-3cI7gMDTp6MieOPFlRHmiqLDMF7ZI5TstjSGvnQ35K8yhJVIrWxB9EUVr79mszfiWVznBW-ZJHLoNJrit4bz-2UWXC6_LamvA78id6DpH2kPqo8hjd_78bLh-solyUt3cVmZ5NB7QiLpSjMGEZxwsw.-nN0AHWYCDJQRRUmkOXJKw; intercom-session-x55eda6t=ZDliWGtWNXZMT09CdmZIeXlMbzAxdXVFOUp1KzdvWWEyTjA2RTFqZEpCMjc3cHJPeVpLbzFSU0xzWEd0YnJqRDRyZ28rRjZjWVgvbkIwVWJ3aVNUS1BSREgwTGxyUHFlQmhBTWxJZUFKNlk9LS00ZlBrVjFiem5zVEI5NFp6enhUYSt3PT0=--32257d353f34769a2e39c791912b0f394972d766",
    Referer: "https://www.blackbox.ai/chat/Uw9astT?model=openai/gpt-5-chat",
  }
}
export default buildHeaders
