export async function GET(request) {

   console.log("request from vault ", request)

     return Response.json("Hello moto")
  }