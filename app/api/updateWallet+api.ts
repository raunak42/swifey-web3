import { prisma } from "@/db/prisma/prismaCLient";
import { getSession } from "@/utils/session";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return Response.json({ message: "Unauthorized", status: 401 });
        }

        const { walletAddress } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: { walletAddress },
        });

        return Response.json({ 
            message: "Wallet address updated successfully", 
            status: 200,
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating wallet:', error);
        return Response.json({ 
            message: "Failed to update wallet address", 
            status: 500 
        });
    }
} 