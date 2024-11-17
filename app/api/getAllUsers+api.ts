import { prisma } from "@/db/prisma/prismaCLient";

export async function GET(req: Request) {

    const res = await prisma.user.findMany()

    console.log("res:", res)

    return Response.json({ users: res, status: 200 })
}