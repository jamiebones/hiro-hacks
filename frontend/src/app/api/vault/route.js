export async function POST(req) {
  const chunks = [];
  for await (const chunk of req.body) {
    chunks.push(chunk);
  }
  // Join the chunks into a single ArrayBuffer
  const buffer = new Uint8Array(chunks.length * chunks[0].byteLength).fill(0);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }

  const decoder = new TextDecoder('utf-8');
  const data = decoder.decode(buffer);
   
  let dataToClient = {}
  if (data) {
    const timestamp = data["apply"][0]["timestamp"]
    const transactionType = data["apply"][0]["transactions"][0]["operations"][0]["type"]
    const transactionStatus = data["apply"][0]["transactions"][0]["operations"][0]["status"]
    const amountTransfered = data["apply"][0]["transactions"][0]["operations"][0]["amount"]["value"]
    const receiver = data["apply"][0]["transactions"][0]["operations"][0]["account"]["address"]
    const sender = data["apply"][0]["transactions"][0]["metadata"]["sender"]
    const senderNonce = data["apply"][0]["transactions"][0]["metadata"]["nonce"]
    const transFee = data["apply"][0]["transactions"][0]["metadata"]["fee"]

    const chainHookType = data["apply"][0]["transactions"][0]["metadata"]["kind"]

    dataToClient = {
      timestamp,
      transactionType,
      transactionStatus,
      amountTransfered,
      receiver,
      sender,
      senderNonce,
      transFee,
      chainHookType

    }
  }


  console.log(dataToClient)
  return Response.json(dataToClient);
}
