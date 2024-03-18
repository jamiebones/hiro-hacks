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
  const decodedString = decoder.decode(buffer);

  console.log(decodedString); 

  return Response.json(decodedString); 
}
 