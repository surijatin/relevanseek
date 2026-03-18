import os
from dotenv import load_dotenv, find_dotenv

# This forces Python to read the .env file in your folder
load_dotenv(find_dotenv())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import JobDetailsRequest, PeopleSearchRequest
from app.utils import (
    analyze_job_posting,
    search_linkedin_staff,
    format_profile_data,
    score_profiles,
)
import ast

allow_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI(title="RelevanSeek API Service", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
@app.get("/")
async def root():
    return {
        "service": "RelevanSeek API Service",
        "version": "0.1.0",
        "status": "active",
        "description": "This API provides job details and matching profiles.",
    }


@app.post("/fetch-details")
async def fetch_details(request: JobDetailsRequest):
    response = analyze_job_posting(request.jd)
    job_info = response.dict()
    return job_info


@app.post("/find-people")
async def find_people(request: PeopleSearchRequest):
    try:
        # Extract job information from the request
        job_info = {
            "company_name": request.company_name,
            "target_role": request.target_role,
            "relevant_titles": request.relevant_titles,
            "location": request.location,
            "job_summary": request.job_summary,
        }

        # Perform the LinkedIn staff search
        contacts_df = search_linkedin_staff(job_info, max_results=10)
        
        # Return early with helpful message if no contacts found
        if contacts_df.empty:
            return {"error": "No LinkedIn contacts found for the provided job information."}
            
        # contacts_df.to_csv("contacts_df.csv", index=False)
        formatted_profiles = format_profile_data(contacts_df)

        # Score the profiles based on the job information
        scored_profiles = score_profiles(formatted_profiles, job_info)

        # Return early if no profiles were scored
        if not scored_profiles:
            return {"error": "No relevant profiles found for scoring."}

        # Append additional data from contacts_df to scored_profiles based on profile_id
        updated_profiles = []

        for scored_profile in scored_profiles:
            new_profile = (
                scored_profile.dict()
            )  # Convert to dictionary for easier manipulation
            profile_id = new_profile["profile_id"]
            contact = contacts_df.loc[contacts_df["profile_id"] == profile_id]
            if not contact.empty:
                contact_data = contact.iloc[0]
                new_profile["headline"] = contact_data.get("headline", "")
                
                # Use headline as fallback for current_position if it's None or empty
                fetched_position = contact_data.get("current_position")
                if not fetched_position or fetched_position == "None":
                    new_profile["current_position"] = new_profile.get("headline", "")
                else:
                    new_profile["current_position"] = fetched_position
                
                new_profile["profile_link"] = contact_data.get("profile_link", "")
                new_profile["profile_photo"] = contact_data.get("profile_photo", "")
                
                # Handle potential emails - ensure it's a list
                emails = contact_data.get("potential_emails")
                if isinstance(emails, list):
                    new_profile["potential_emails"] = emails
                elif isinstance(emails, str) and emails.startswith("["):
                    try:
                        new_profile["potential_emails"] = ast.literal_eval(emails)
                    except:
                        new_profile["potential_emails"] = [emails]
                else:
                    new_profile["potential_emails"] = [emails] if emails else []
                    
            updated_profiles.append(new_profile)

        return updated_profiles
    except Exception as e:
        import traceback
        error_message = f"Error in find-people endpoint: {str(e)}"
        error_traceback = traceback.format_exc()
        print(error_message)
        print(error_traceback)
        return {"error": error_message, "details": str(e)}
