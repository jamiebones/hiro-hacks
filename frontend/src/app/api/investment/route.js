export async function GET(request) {

    console.log("request from investment ", request)
 
      return Response.json("Hello investment")
   }