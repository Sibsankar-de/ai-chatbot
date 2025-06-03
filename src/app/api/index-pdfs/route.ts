import { processPDFs } from "@/lib/pdf-utils";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await processPDFs();
        return NextResponse.json({ message: "PDFs processed and stored in MongoDb." });
    } catch (error) {
        console.error("Error processing PDFs:", error);
        return NextResponse.json({ error: "Failed to process PDFs." }, { status: 500 });
    }
}
export const runtime = "nodejs";