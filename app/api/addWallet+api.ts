import { prisma } from "@/db/prisma/prismaCLient";

export interface addWalletProps {
    id: string;
    walletAddress: string;
}

export async function POST(req: Request) {
    const body: addWalletProps = await req.json()
    console.log(body)

    const res = await prisma.user.update({ 
        where: {
            id: body.id
        },
        data: {
            walletAddress: body.walletAddress
        }
    })

    console.log("res:", res)

    return Response.json({ message: res, status: 200 })
}