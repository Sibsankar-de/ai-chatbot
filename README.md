# Chatbot PDF QA

This project is a chatbot that answers user queries based on the content of a provided PDF document.

## Features

- Fetches and processes data from PDF files.
- Answers questions using the information extracted from the PDF.
- Utilizes MongoDB as a vector database for efficient retrieval.
- Employs OpenAI embedding model for semantic search.
- Uses DeepSeek LLM model for generating responses.

## How It Works

1. **PDF Ingestion:** The PDF is parsed and its content is embedded using the OpenAI embedding model.
2. **Vector Storage:** The embeddings are stored in MongoDB as a vector database.
3. **Query Handling:** User queries are embedded and matched against stored vectors to find relevant PDF sections.
4. **Response Generation:** The DeepSeek LLM model generates answers based on the matched content.

## Requirements

- NEXT.js
- MongoDB
- OpenAI API access
- DeepSeek LLM access

## Setup

1. Clone the repository.
2. Install dependencies.
3. Configure your MongoDB, OpenAI, and DeepSeek credentials.
4. Run the application.

## Usage

- Ask questions.
- Receive accurate, context-aware answers.
