import { prisma } from "@/db/prisma/prismaCLient";

export interface createUserProps {
    name: string;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    graduatedFrom: string;
    currentlyWorkingAt: string;
    walletAddress: string
}

export async function POST(req: Request) {
    const body: createUserProps = await req.json()

    const res = await prisma.user.create({
        data: {
            name: body.name,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            graduatedFrom: body.graduatedFrom,
            currentlyWorking: body.currentlyWorkingAt,
            walletAddress: body.walletAddress,
        }
    })

    return Response.json({ message: res, status: 200 })
}