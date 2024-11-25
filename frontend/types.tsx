export interface JobDetails {
  target_role: string;
  company_name: string;
  location: string;
  job_summary: string;
  relevant_titles: string[];
}

export interface Profile {
  profile_id: string;
  name: string;
  profile_photo: string | null;
  current_position: string;
  headline: string;
  relevance_score: number;
  profile_link: string;
  reasoning: string;
  potential_emails: string[];
}
