# RelevanSeek

An AI-powered connection finder that takes the guesswork out of job networking.

## What is RelevanSeek?

RelevanSeek is an intelligent platform that helps job seekers find and connect with the right people who can influence hiring decisions at companies they're interested in.

## Motivation

RelevanSeek was born from the personal job search challenges faced by Om and me. Traditional networking approaches are time-consuming and often ineffective. RelevanSeek leverages AI to decode job descriptions and match you with relevant employees who can champion your application, transforming how people approach job networking.

## Key Features

- **Intelligent JD Analysis**: Leverages GPT-4o to decode job descriptions and extract crucial role requirements, skills, and organizational context.
- **Smart Employee Matching**: Uses advanced LinkedIn data to identify and connect you with the right people across departments and positions.
- **Connection Impact Scoring**: AI-powered algorithm ranks potential connections on a scale of 1-10, helping you focus on people who can actually influence hiring decisions.

## Tech Stack

### Backend

- Python
- FastAPI
- LangChain - For building LLM-powered applications
- StaffSpy - For LinkedIn data and insights

### Frontend

- Next.js - React framework
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - Reusable UI components

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue to improve RelevanSeek.

## Steps to Run This Project

### For Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm i
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and access the frontend at [http://localhost:3000](http://localhost:3000)

### For Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Activate the virtual environment:

   ```bash
   source venv/bin/activate
   ```

3. Run the backend server:
   ```bash
   make run
   ```
