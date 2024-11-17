import { prisma } from "@/db/prisma/prismaCLient";

export interface LoginProps {
    name: string;
    password: string;
}

export async function POST(req: Request) {
    try {
        const body: LoginProps = await req.json();
        
        const user = await prisma.user.findFirst({
            where: {
                name: body.name,
                password: body.password
            },
            select: {
                id: true,
                name: true,
            }
        });

        if (!user) {
            return Response.json({ 
                message: "Invalid credentials", 
                status: 401 
            });
        }

        return Response.json({ 
            userId: user.id,
            name: user.name,
            status: 200 
        });
    } catch (error) {
        return Response.json({ 
            message: "Server error", 
            status: 500 
        });
    }
}