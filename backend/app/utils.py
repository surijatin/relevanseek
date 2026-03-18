import os
from dotenv import load_dotenv, find_dotenv

# This forces Python to read the .env file in your folder
load_dotenv(find_dotenv())

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.models import SearchKeywords, ProfileScore, BatchProfileScoring
from pathlib import Path
import pandas as pd
import ast
from typing import List
import random
import base64


def analyze_job_posting(job_description: str) -> SearchKeywords:
    """Extract relevant information for LinkedIn searching."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    print(f"DEBUG: GOOGLE_API_KEY found: {api_key is not None}")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite-preview",
        google_api_key=api_key,
        transport="rest",
        temperature=0.1
    )

    system_prompt = """
    You are an expert in tech industry organizational structures and job hierarchies.
    Extract precise information from the job posting for LinkedIn searching.

    Focus on:
    1. Company name (exact name only)
    2. Target role (exact title from posting)
    3. Location (only physical location - city/state/country, exclude Remote/Hybrid)
    4. Generate exactly 3 most relevant titles for searching potential referrers:
       - Same level: The exact role title
       - Direct Manager: The immediate supervisor role (e.g., Engineering Manager for Software Engineer)
       - Department Head: Director or Head of the department
    5. Create a concise job summary (2-3 sentences) focusing on:
       - Key responsibilities
       - Required technical skills
       - Team context or project focus
       - Level of seniority

    Guidelines:
    - Use standard industry titles that are commonly found on LinkedIn
    - Be specific with titles (e.g., "Engineering Manager, Software" instead of just "Manager")
    - Ensure titles are relevant to the company's structure
    - Keep location clean (only geographical location)
    - Make the job summary focused and relevant for finding potential referrers
    """

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=job_description),
    ]

    response = llm.with_structured_output(SearchKeywords).invoke(messages)
    return response


def search_linkedin_staff(job_info: SearchKeywords, max_results: int) -> pd.DataFrame:
    """Search LinkedIn for staff members, first with location then without if no results found."""
    from staffspy import LinkedInAccount
    # Check for environment variables first
    env_session_files = load_session_from_env()
    
    # Define session files
    # Use /tmp directory for serverless environments
    tmp_dir = "/tmp" if os.path.exists("/tmp") else str(Path().resolve())
    potential_session_files = [
        Path(tmp_dir) / "session.pkl",
        Path(tmp_dir) / "session2.pkl"
    ]
    
    # Filter only files that actually exist
    local_session_files = [f for f in potential_session_files if f.exists()]
    
    # Use env files if available, otherwise use existing local files
    session_files = env_session_files if env_session_files else local_session_files

    # Randomly select a session file
    if not session_files:
        error_msg = "No session files available (session.pkl not found). Please run 'python login_linkedin.py' manually in the backend directory."
        print(f"\nERROR: {error_msg}")
        raise Exception(error_msg)

    session_file = random.choice(session_files)
    print(f"\nUsing session file: {session_file.name}")

    account = LinkedInAccount(
        session_file=str(session_file),
        log_level=1,
    )

    all_staff_data = []

    # First attempt: Search with location
    print(f"\nSearching for staff in {job_info['location']}...")
    for title in job_info['relevant_titles']:
        try:
            staff = account.scrape_staff(
                company_name=job_info['company_name'],
                search_term=title,
                location=job_info['location'],
                extra_profile_data=True,
                max_results=max_results,
            )
            if not staff.empty:
                staff["search_title"] = title
                all_staff_data.append(staff)
                print(f"Found {len(staff)} results for {title}")

        except Exception as e:
            print(f"Error searching for {title}: {str(e)}")
            continue

    # If no results found, try without location
    if not all_staff_data:
        print(f"\nNo results found in {job_info['location']}. Searching globally...")
        for title in job_info['relevant_titles']:
            try:
                staff = account.scrape_staff(
                    company_name=job_info['company_name'],
                    search_term=title,
                    location=None,  # Remove location constraint
                    extra_profile_data=True,
                    max_results=max_results,
                )
                if not staff.empty:
                    staff["search_title"] = title
                    all_staff_data.append(staff)
                    print(f"Found {len(staff)} results for {title}")

            except Exception as e:
                print(f"Error searching for {title}: {str(e)}")
                continue

    # Combine all results into a single DataFrame
    if all_staff_data:
        final_df = pd.concat(all_staff_data, ignore_index=True)
        print(f"\nTotal unique profiles found: {len(final_df)}")
        return final_df
    else:
        print("\nNo results found in any search.")
        return pd.DataFrame()  # Return empty DataFrame if no results

def format_profile_data(profiles_df: pd.DataFrame) -> str:
    """Format profile data into a clean, readable string format for the LLM."""
    formatted_profiles = []

    for _, profile in profiles_df.iterrows():
        try:
            # Parse experiences string into list of dicts if it's a string
            if isinstance(profile["experiences"], str):
                experiences = ast.literal_eval(profile["experiences"])
            else:
                experiences = profile["experiences"]

            # Parse skills string into list of dicts if it's a string
            if isinstance(profile["skills"], str):
                skills = ast.literal_eval(profile["skills"])
            else:
                skills = profile["skills"]

            # Format experiences (take most recent 2)
            experiences_formatted = []
            if experiences and isinstance(experiences, list):
                for exp in experiences[:2]:
                    if isinstance(exp, dict):
                        # Try multiple possible key names for duration/date
                        title = exp.get('title', 'N/A')
                        company = exp.get('company', 'N/A')
                        
                        # Handle different possible key names for duration
                        duration = exp.get('duration') or exp.get('time_period')
                        if not duration:
                            start = exp.get('start_date') or exp.get('from_date', '')
                            end = exp.get('end_date') or exp.get('to_date', 'Present')
                            if start:
                                duration = f"{start} - {end}"
                            else:
                                duration = "N/A"
                                
                        exp_str = f"{title} at {company} ({duration})"
                        experiences_formatted.append(exp_str)
           
            experiences_str = " | ".join(experiences_formatted) if experiences_formatted else "None listed"
           
            # Format skills (take top 10)
            skills_formatted = []
            if skills and isinstance(skills, list):
                skills_formatted = [skill.get('name', '') for skill in skills[:10] if isinstance(skill, dict) and skill.get('name')]
            
            skills_str = ", ".join(skills_formatted) if skills_formatted else "None listed"

            # Create formatted profile string
            profile_text = f"""
            Profile ID: {profile.get('profile_id', 'N/A')}
            Name: {profile.get('name', 'N/A')}
            Headline: {profile.get('headline', 'N/A')}
            About: {profile.get('bio', 'None provided')}
            Current Position: {profile.get('current_position', 'N/A')}
            Skills: {skills_str}
            Recent Experience: {experiences_str}
            """
            formatted_profiles.append(profile_text)

        except Exception as e:
            print(f"Error formatting profile {profile.get('name', 'N/A')}: {str(e)}")
            continue

    # Join all profiles with a separator
    all_profiles = "\n---\n".join(formatted_profiles)

    # Print sample for verification
    print("\n=== Sample Formatted Profile ===")
    print(formatted_profiles[0] if formatted_profiles else "No profiles found")
    print(f"\nTotal profiles formatted: {len(formatted_profiles)}")

    return all_profiles


def score_profiles(
    profile_str: str, job_info: SearchKeywords
) -> List[ProfileScore]:
    """Score profiles based on relevance to job summary."""

    api_key = os.environ.get("GOOGLE_API_KEY")
    print(f"DEBUG: GOOGLE_API_KEY found: {api_key is not None}")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.1-flash-lite-preview",
        google_api_key=api_key,
        transport="rest",
        temperature=0.1
    )

    system_prompt = """
    You are evaluating LinkedIn profiles to find the most relevant people who could either:
    a) Be the potential hiring manager for this position
    b) Work closely with the hiring manager
    c) Provide a strong referral due to their role relevance
    
    For example, for a Data Engineer position:
    - Potential Hiring Managers: 
        * Manager, Data Engineering
        * Head of Data Engineering
        * Director of Data Engineering
        * VP of Data
    - People Working Closely with Hiring Manager:
        * Senior Data Engineers (often team leads)
        * Data Engineers on the same team
        * Analytics Engineers (collaborating team)
    
    Analyze each profile and provide a relevance score based on all available information,
    including their Headline, About/Bio, Current Position, Skills, and Experience.
    
    IMPORTANT: If structured fields like 'Current Position' or 'Recent Experience' are missing (N/A),
    RELY HEAVILY on the 'Headline' and 'About' sections to determine their role and seniority.
    
    Criteria for evaluation:
    1. Hiring Manager Potential (Highest Priority, Score 9-10):
       - Is this person a Manager/Director/Head of Data Engineering?
       - Do they lead the data engineering team?
       - Are they in a position to make hiring decisions?
       
    2. Team Proximity (High Priority, Score 7-8):
       - Are they a Senior Data Engineer likely working closely with the manager?
       - Are they on the same data engineering team?
       - Do they collaborate directly with the target role?
       
    3. Role Relevance (Medium Priority, Score 4-6):
       - Current Data Engineers in similar positions
       - Team members in related roles (Analytics, ML Engineers)
       - Same department but different team
    
    Return a JSON array of scored profiles, with each profile containing:
    - profile_id: The provided profile ID
    - name: The person's name
    - current_position: Their current role
    - relevance_score: A score from 1-10 where:
        10: Direct hiring manager (e.g., Manager, Data Engineering)
        9: Senior leadership in department (Director/Head of Data)
        8: Senior team member working directly with hiring manager
        7: Team member working closely with the role
        6: Same team, different level
        5: Related team, similar role
        4: Department member, different team
        3: Company employee, different department
        2-1: Limited relevance
    - reasoning: Brief explanation focusing on why they would be valuable to connect with (max 2 sentences)
    
    Sort the profiles by relevance_score in descending order and return only the top 10.
    Consider organizational hierarchy and reporting structures when scoring.
    """

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(
            content=f"""
        Job Information:
        Company: {job_info['company_name']}
        Role: {job_info['target_role']}
        Job Summary: {job_info['job_summary']}
        
        Profiles to Evaluate:
        {profile_str}
        
        Return the results as a JSON array of objects with the specified fields.
        """
        ),
    ]
    if profile_str:
        try:
            response = llm.with_structured_output(BatchProfileScoring).invoke(messages)
            return response.scored_profiles  # Return top 10 profiles
        except Exception as e:
            print(f"Error scoring profiles: {str(e)}")
            return []
    else:
        print("Sorry, no profiles found for scoring for this job.")
        return []



from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pickle
import time
import requests
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())


def set_csrf_token(session):
    print("Setting CSRF token...")
    csrf_token = session.cookies.get("JSESSIONID", "").replace('"', "")
    if csrf_token:
        print(f"CSRF token: {csrf_token}")
        session.headers.update({"Csrf-Token": csrf_token})
    else:
        print("CSRF token not found in cookies.")
    return session


def save_session(session, session_file: str):
    data = {"cookies": session.cookies, "headers": session.headers}
    with open(session_file, "wb") as f:
        pickle.dump(data, f)


def save_linkedin_cookies(username: str, password: str, file_name: str):
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # Optional: Keep it visible for login
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get("https://www.linkedin.com/login")

        email_elem = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        email_elem.send_keys(username)

        password_elem = driver.find_element(By.ID, "password")
        password_elem.send_keys(password)

        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()

        # Wait for the user to solve any captchas and for the home page to load
        print("\nPlease solve any captchas and log in manually in the opened browser window...")
        WebDriverWait(driver, 120).until(
            EC.presence_of_element_located((By.ID, "global-nav"))
        )

        time.sleep(5)

        selenium_cookies = driver.get_cookies()
        session = requests.Session()

        for cookie in selenium_cookies:
            session.cookies.set(cookie["name"], cookie["value"])

        session = set_csrf_token(session)
        save_session(session, file_name)

        print(f"Session data saved successfully to {file_name}!")

    except Exception as e:
        print(f"An error occurred during LinkedIn login: {str(e)}")

    finally:
        driver.quit()

def load_session_from_env():
    session_env = os.environ.get("LINKEDIN_SESSION_BASE64")
    session2_env = os.environ.get("LINKEDIN_SESSION2_BASE64")
    
    session_files = []
    
    # Use /tmp directory for serverless environments
    tmp_dir = "/tmp" if os.path.exists("/tmp") else str(Path().resolve())
    
    if session_env:
        # Decode and save session.pkl to /tmp directory
        session_path = Path(tmp_dir) / "session.pkl"
        with open(session_path, "wb") as f:
            f.write(base64.b64decode(session_env))
        session_files.append(session_path)
    
    if session2_env:
        # Decode and save session2.pkl to /tmp directory
        session2_path = Path(tmp_dir) / "session2.pkl"
        with open(session2_path, "wb") as f:
            f.write(base64.b64decode(session2_env))
        session_files.append(session2_path)
    
    return session_files