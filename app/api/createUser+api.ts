import { prisma } from "@/db/prisma/prismaCLient";

export interface createUserProps {
    name: string;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    graduatedFrom: string;
    currentlyWorking: string;
    walletAddress: string
    password: string;

}

export async function POST(req: Request) {
    const body: createUserProps = await req.json()
    console.log(body)

    const res = await prisma.user.create({
        data: {
            name: body.name,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            graduatedFrom: body.graduatedFrom,
            currentlyWorking: body.currentlyWorking,
            password: body.password
        }
    })

    console.log("res:", res)

    return Response.json({ message: res, status: 200 })
}