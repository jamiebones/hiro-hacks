import { promises as fs } from 'fs';

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
  let data = decoder.decode(buffer);
  data = JSON.parse(data)

const timestamp = data["apply"][0]["timestamp"]
const transactionType = data["apply"][0]["transactions"][0]["operations"][0]["type"]
const transactionStatus = data["apply"][0]["transactions"][0]["operations"][0]["status"]
const amountTransfered = data["apply"][0]["transactions"][0]["operations"][0]["amount"]["value"]
const receiver = data["apply"][0]["transactions"][0]["operations"][0]["account"]["address"]
const sender = data["apply"][0]["transactions"][0]["metadata"]["sender"]
const senderNonce = data["apply"][0]["transactions"][0]["metadata"]["nonce"]
const transFee = data["apply"][0]["transactions"][0]["metadata"]["fee"]

const chainHookType = data["apply"][0]["transactions"][0]["metadata"]["kind"]

const transData = {
  timestamp,
  transactionStatus,
  transactionType,
  amountTransfered,
  receiver,
  sender,
  senderNonce,
  transFee,
  chainHookType

}
  console.log(transData)
  let existingData;
  try {
    existingData = JSON.parse(await fs.readFile('data.json', 'utf-8')); // Read existing data
  } catch (error) {
    if (error.code === 'ENOENT') { // File doesn't exist, create it with empty array
      existingData = [];
    } else {
      console.error(error);
      return Response.status(500).json({ message: 'Error reading data' });
    }
  }

  existingData.push(data); // Append new data to the array

  await fs.writeFile('data.json', JSON.stringify(existingData, null, 2));
  return Response.json(transData);
}

export async function GET(req, res) {
      try {
          const data = await fs.readFile('data.json', 'utf-8'); // Read file content
          return Response.json(JSON.parse(data)); // Parse and send data
      } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error reading data' });
      }
   
  }

