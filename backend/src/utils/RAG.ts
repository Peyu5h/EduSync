import fs from "fs";
import path from "path";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

let vectorStore = null;

export const initializeVectorStore = async () => {
  if (vectorStore) {
    return vectorStore;
  }

  console.log("Creating new PYQ vector store...");

  try {
    const filePath = path.join(process.cwd(), "pyq.txt");

    const textContent = fs.readFileSync(filePath, "utf-8");

    const documents = [new Document({ pageContent: textContent })];

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 50,
      separator: "\n\n",
    });

    const docs = await textSplitter.splitDocuments(documents);
    console.log(`Split PYQ document into ${docs.length} chunks`);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_AI_API_KEY,
      modelName: "models/embedding-001",
    });

    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    console.log("PYQ Vector store created successfully!");
    return vectorStore;
  } catch (error) {
    console.error("Error initializing PYQ vector store:", error);
    throw error;
  }
};

export const getRelevantPYQs = async (documentText, count = 5) => {
  try {
    const store = await initializeVectorStore();

    const relevantQuestions = await store.similaritySearch(documentText, count);

    const formattedQuestions = relevantQuestions.map((doc) =>
      doc.pageContent.trim(),
    );

    return {
      success: true,
      data: formattedQuestions,
    };
  } catch (error) {
    console.error("Error retrieving relevant PYQs:", error);
    return {
      success: false,
      message: "Failed to retrieve relevant previous year questions",
      error: error.message,
    };
  }
};

export const generateRAGEnhancedNotes = async (documentText, promptText) => {
  try {
    const pyqResponse = await getRelevantPYQs(documentText);

    if (!pyqResponse.success) {
      throw new Error(pyqResponse.message);
    }

    const pyqContext = pyqResponse.data.join("\n\n");
    const enhancedPrompt = `
${promptText}

Additionally, here are some relevant previous year questions related to this topic. Make sure your notes help address these questions:

${pyqContext}

Please incorporate relevant material to help students answer these types of questions in their exams.`;

    return {
      success: true,
      enhancedPrompt,
    };
  } catch (error) {
    console.error("Error generating RAG-enhanced prompt:", error);
    return {
      success: false,
      message: "Failed to enhance the prompt with relevant questions",
      error: error.message,
    };
  }
};
