<h1 align="center">Beetroot - Docs</h1>

This repository contains the **documentation source code** for the Beetroot project.

Beetroot is an AWS-based photo system that:
- detects faces using **Amazon Rekognition**
- groups faces into **People** (using Rekognition Collections)
- stores relationships in **DynamoDB** (`Persons`, `Occurrences`, `Photos`)
- exposes a small **HTTP API** (API Gateway → Lambda) for the React frontend
- serves images securely using **pre-signed S3 URLs**

## What’s inside

- 📚 **Docs site source** (Fumadocs)
- 🧱 Step-by-step chapters for the backend build (S3 → Lambda → Rekognition → DynamoDB → API)
- 🔐 Notes on IAM least-privilege, common mistakes, and debugging checkpoints

## Local setup

1) Install dependencies
```bash
npm install
````

2. Start the docs site

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm run start
```

## Requirements

* Node.js 18+ (recommended)
* npm / pnpm / yarn / bun (any is fine)

## Related repos

* Frontend code: [beetroot](https://github.com/saarthaksinghal/beetroot)

## Credits

- [Fumadocs](https://fumadocs.dev) - learn about Fumadocs
