import { MongoDBAtlasVectorSearch } from "@langchain/community/vectorstores/mongodb_atlas";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { MongoClient } from "mongodb";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const VECTOR_DB_NAME = "vectorDB";
const VECTOR_COLLECTION = "pdf_documents";
const VECTOR_INDEX_NAME = "default";

const client = new MongoClient(MONGODB_URI);
const db = client.db(VECTOR_DB_NAME);
const collection = db.collection(VECTOR_COLLECTION);


// Function to process PDFs and store them in MongoDB Atlas
export async function processPDFs() {
  try {

    await checkMongoConnection();
    console.log("MongoDB connection established successfully.");

    const pdfDir = path.join(process.cwd(), "public", "pdfs");

    const loader = new DirectoryLoader(pdfDir, {
      ".pdf": (path) => new PDFLoader(path),
    });
    const docs = await loader.load();


    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);


    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });

    // Clear the old documents from the collection to maintain only the latest data
    await collection.deleteMany({});
    console.log(`Cleared old documents from: ${VECTOR_COLLECTION}`);

    console.log(`Inserting ${splitDocs.length} document chunks into MongoDB Atlas...`);
    
    await MongoDBAtlasVectorSearch.fromDocuments(splitDocs, embeddings, {
      collection,
      indexName: VECTOR_INDEX_NAME,
    });

    console.log(`Inserted ${splitDocs.length} document chunks`);
    return {
      success: true,
      count: splitDocs.length,
    };
  } catch (error) {
    console.error("Processing failed:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

// Function to query PDFs using vector search
export async function queryPDFs(query: string, k = 5) {
  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection,
      indexName: VECTOR_INDEX_NAME,
    });

    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error("Query failed:", error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}


// Function to check MongoDB connection
export async function checkMongoConnection() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(VECTOR_DB_NAME);
    const admin = db.admin();
    const serverStatus = await admin.serverStatus();

    return {
      connected: true,
      version: serverStatus.version,
      host: serverStatus.host,
      uptime: serverStatus.uptime,
    };
  } catch (error) {
    // throw new Error(error instanceof Error ? error.message : String(error));
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client.close();
  }
}
