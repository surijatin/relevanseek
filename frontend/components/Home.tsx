"use client";

import { useState } from "react";
import SearchArea from "@/components/SearchArea/SearchArea";
import JobDetails from "@/components/JobDetails/JobDetails";
import MatchingProfiles from "@/components/MatchingProfiles/MatchingProfiles";
import { JobDetails as JobDetailsType, Profile } from "@/types";

export function Home() {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoadingStep1, setIsLoadingStep1] = useState<boolean>(false);
  const [isLoadingStep2, setIsLoadingStep2] = useState<boolean>(false);
  const [jobDetails, setJobDetails] = useState<JobDetailsType | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setJobDetails(null);
    setProfiles([]);

    let respJobDetails = null;
    // Step 1: Get job details
    setIsLoadingStep1(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/fetch-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jd: jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      respJobDetails = await response.json();
      setJobDetails(respJobDetails);
    } catch (error) {
      console.error("Error fetching job details", error);
      setError("Failed to fetch job details. Please try again.");
    } finally {
      setIsLoadingStep1(false);
    }

    // Step 2: Get matching profiles
    setIsLoadingStep2(true);
    try {
      const responseProfiles = await fetch(
        "http://127.0.0.1:8000/find-people",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: respJobDetails?.company_name,
            target_role: respJobDetails?.target_role,
            relevant_titles: respJobDetails?.relevant_titles,
            location: respJobDetails?.location,
            job_summary: respJobDetails?.job_summary,
          }),
        }
      );

      if (!responseProfiles.ok) {
        throw new Error("Network response was not ok");
      }

      const matchingProfiles: Profile[] = await responseProfiles.json();
      setProfiles(matchingProfiles);
    } catch {
      setError("Failed to fetch matching profiles. Please try again.");
    } finally {
      setIsLoadingStep2(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFF2EB] to-[#B9E5E8] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-extrabold mb-10 text-[#7AB2D3] text-center tracking-wide drop-shadow-lg">
          Relevan<span className="text-[#4A628A]">Seek</span>
        </h1>

        <SearchArea
          handleSubmit={handleSubmit}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          isLoadingStep1={isLoadingStep1}
          isLoadingStep2={isLoadingStep2}
          error={error}
        />

        <JobDetails jobDetails={jobDetails} />

        <MatchingProfiles profiles={profiles} />
      </div>
    </div>
  );
}
