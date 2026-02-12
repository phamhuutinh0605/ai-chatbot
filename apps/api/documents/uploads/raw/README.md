# Documents Folder

This folder contains the initial knowledge base documents for the Shinhan DS AI Chatbot.

## Initial Documents

- `leave_policy.md` - Employee leave and time-off policies
- `salary_policy.md` - Compensation and benefits information
- `it_security_policy.md` - IT security guidelines and requirements
- `onboarding_guide.md` - New employee onboarding procedures

## Adding New Documents

To add new documents to the knowledge base:

1. Place your document files (`.md`, `.txt`, `.pdf`, `.doc`, `.docx`) in this folder
2. The API will automatically detect and list them via the `/api/v1/documents` endpoint
3. Documents need to be indexed using the `/api/v1/documents/index` endpoint before they can be used for RAG

## Supported Formats

- Markdown (`.md`)
- Plain text (`.txt`)
- PDF (`.pdf`)
- Word documents (`.doc`, `.docx`)

## File Size Limit

Maximum file size: 10MB per document
