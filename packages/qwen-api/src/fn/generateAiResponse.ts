export async function generateAiResponse(
  streamResponse: any,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) {
  try {
    // Send start event
    const startEvent = `event: start\ndata: {"id":"${Date.now()}"}\n\n`
    writer.write(encoder.encode(startEvent))

    // Stream the AI response
    for await (const chunk of streamResponse) {
      const event = `data: ${JSON.stringify({
        choices: chunk.choices,
        timestamp: Date.now(),
      })}\n\n`

      writer.write(encoder.encode(event))
    }

    // Send completion event
    const endEvent = `event: complete\ndata: {"timestamp":${Date.now()}}\n\n`
    writer.write(encoder.encode(endEvent))
  } catch (error) {
    // Send error event
    const errorEvent = `event: error\ndata: ${JSON.stringify({
      //@ts-ignore
      error: error.message,
    })}\n\n`
    writer.write(encoder.encode(errorEvent))
  } finally {
    writer.close()
  }
}
