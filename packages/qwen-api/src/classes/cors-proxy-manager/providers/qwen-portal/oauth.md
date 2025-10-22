```
POST
https://chat.qwen.ai/api/v1/oauth2/token

Key=grant_type; Value=refresh_token
Key=refresh_token; Value=U6HTbxlH5s2pYr7rKdsq6D8MPqo7TTP_xEBTkPkezEz0BB58-lye5q-gkGslntheeo6AnBjmN1c-4uDmzkgPhw
Key=client_id; Value=f0304373b74a44d2b584a3fb70ca9e56
```

Response

```json
{
  "status": "success",
  "access_token": "c1RdRw6trCM7IIjtqzYjmhg8EPXT18Q5_cpOXMD9QFhP3ZCPGuAbk0FpXorGAREdo3zRR1a-UsYRCO5HLsFmog",
  "refresh_token": "ay2c5XARrn0LliLHoRFnjkAa2RRifOTvV5ndwIQuBj398QAFv9ZYWqgT5Uwm0cpVUMajugcE9Pt3BsCCKRHQoQ",
  "token_type": "Bearer",
  "expires_in": 21600,
  "scope": "openid profile email model.completion",
  "resource_url": "portal.qwen.ai"
}
```
