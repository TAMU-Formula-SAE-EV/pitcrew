import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;

export async function POST(req: Request) {
    try {
        if (!CONNECTION_STRING) {
            throw new Error("Azure Storage connection string is not set.");
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        console.log(file);

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());

        // secure azure blob container connection
        const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        await containerClient.createIfNotExists({ access: "blob" });

        // generate unique file name
        const newFilename = `${Date.now()}-${file.name}`;

        // create a block blob client and upload
        const blobClient = containerClient.getBlockBlobClient(newFilename);
        await blobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: 'application/pdf',
                blobContentDisposition: 'inline',
            },
        });

        return NextResponse.json({ url: blobClient.url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
