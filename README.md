# Budvisory AI

![Budvisory-AI logo](public/budvisory-ai-logo.svg)

Budvisory-AI is an AI travel budget advisor designed to help people plan realistic domestic trips in Indonesia. It turns budget constraints into actionable, day-by-day itineraries with practical cost guidance.

## Project Name
Budvisory AI

## Repository Name
budvisory-ai

## Team Members
- Abdul Salam (abdulsalam01)
- Ario Purbo

## Problem Statement
Travel planning is often stressful and uncertain, especially when budgets are tight:

- Travel content is generic and rarely reflects real Indonesian prices.
- Budget uncertainty creates stress and overthinking.
- Travelers don’t know if their plans are financially feasible.

## Solution Overview
Budvisory-AI is budget-first and Indonesia-focused. Users provide:

- Origin city
- Destination
- Trip duration
- Total budget

In seconds, the system generates:

- Day-by-day itinerary
- Estimated costs and savings buffer
- Packing list
- Safety notes

## Tech Stack Used
- **Next.js** for a fast, production-ready web framework with file-based routing, built-in performance optimizations, and a smooth developer experience.
- **TypeScript** for safe, maintainable code with strong typing, enabling efficient collaboration and fewer runtime surprises.

Together, Next.js and TypeScript are a smart, efficient choice for this project because they make it effortless to ship a reliable, performant app while keeping the codebase clean and scalable.

## Setup Instructions
1. Ensure you have Node.js (LTS recommended) and npm installed.
2. Install dependencies:

```bash
npm install
```

## Environment Variables
Create a `.env` file in the project root and add:

```
GEMINI_API_KEY=your_api_key_here
```

## Step-by-Step Guide to Run Locally
1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3006](http://localhost:3006) in your browser.
