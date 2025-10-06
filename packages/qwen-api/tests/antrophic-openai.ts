import OpenAI from "openai"
const config = {
  api_base_url: "https://app.factory.ai/api/llm/o/v1/responses",
  api_key:
    "eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzAxSE5NNzkyTTBGVjNDRVFRRjgxNkRWN1hFIn0.eyJvYmplY3QiOiJ1c2VyIiwiaWQiOiJ1c2VyXzAxSzZINEVKTVg4TVROWUZZMDNONVpEQU5QIiwiZW1haWwiOiJzdXRveW9jdXRlekBnbWFpbC5jb20iLCJmaXJzdF9uYW1lIjoic3V0b3lvY3V0ZXoiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicHJvZmlsZV9waWN0dXJlX3VybCI6Imh0dHBzOi8vd29ya29zY2RuLmNvbS9pbWFnZXMvdjEvWjl2dC1vWEN6S1M3SFIxdVJTVFUyeTVwYlhMT2hNaXdHX2cxTFN2SXUzbyIsImNyZWF0ZWRfYXQiOiIyMDI1LTEwLTAyVDAwOjE2OjQ1LjE2M1oiLCJ1cGRhdGVkX2F0IjoiMjAyNS0xMC0wNVQxMjoxMTowMS42NjJaIiwibWV0YWRhdGEiOnt9LCJleHRlcm5hbF9vcmdfaWQiOiJuTTNEZEtldFlBQjBndG9kdEZLWSIsImlzcyI6Imh0dHBzOi8vYXBpLndvcmtvcy5jb20iLCJzdWIiOiJ1c2VyXzAxSzZINEVKTVg4TVROWUZZMDNONVpEQU5QIiwic2lkIjoic2Vzc2lvbl8wMUs2SDhLN1NZSjgxOEhOMFpRVzBaQjVFRyIsImp0aSI6IjAxSzZWVEQ3RzFQSk5WOVNTNFBBV0pTWFNGIiwib3JnX2lkIjoib3JnXzAxSzZINEVNN1AyRFk2NEEzMUYyUllWWFBGIiwicm9sZSI6Im93bmVyIiwicm9sZXMiOlsib3duZXIiXSwicGVybWlzc2lvbnMiOltdLCJleHAiOjE3NTk3NTE1NzMsImlhdCI6MTc1OTcyMjc3M30.XpjhcvbZjohFTiu0GIHQCM9vWTBOc1C4r-HbNuFrAR7qirQIksO4WnJULKkVG8kjddPDVxf4a5dJSIa9F8mw9jwoda84yWNxDJehgZjmKjqO954rbO0E9iWdiqDYspv_MzGi718YVOaSEyvPTDWdmF-2reHjua24WKp_8nV32hjCbJEP9Ct2NjT2r-lnCHIoBrUb4Ej0IAu82f24FAxhq3QglqG74mrYNBGyQGD0mjD9x03FFiwzMOOVWRyC4vKN57LHgM1kdD4tKOxTEStTHOSgTCZWTCOwxPPNVHlP9ynagq5fnAwOEYoiOIq3-kgrIDrEHJ41FBVqL-VSfEf_2A",
  models: ["gpt-5-2025-08-07", "gpt-5-codex"],
}
const openai = new OpenAI({
  apiKey: config.api_key,
  baseURL: "https://app.factory.ai/api/llm/o/v1", // Claude API endpoint
})
async function main() {
  const response = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Who are you?" }],
    model: config.models[0], // Claude model name
  })
  console.log(response.choices[0].message.content)
}

main().catch((e) => {
  console.error(e)
})
