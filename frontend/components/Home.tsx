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
  const [searchAreaError, setSearchAreaError] = useState<string>("");
  const [jobDetailsError, setJobDetailsError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchAreaError("");
    setJobDetails(null);
    setProfiles([]);

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

      const respJobDetails = await response.json();
      setJobDetails(respJobDetails);
    } catch (error) {
      console.error("Error fetching job details", error);
      setSearchAreaError("Failed to fetch job details. Please try again.");
    } finally {
      setIsLoadingStep1(false);
    }
  };

  const handleConfirm = async (updatedDetails: JobDetailsType) => {
    setJobDetailsError("");
    setProfiles([]);

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
            company_name: updatedDetails.company_name,
            target_role: updatedDetails.target_role,
            relevant_titles: updatedDetails.relevant_titles,
            location: updatedDetails.location,
            job_summary: updatedDetails.job_summary,
          }),
        }
      );

      if (!responseProfiles.ok) {
        throw new Error("Network response was not ok");
      }

      const matchingProfiles: Profile[] = await responseProfiles.json();
      setProfiles(matchingProfiles);
    } catch {
      setJobDetailsError(
        "Failed to fetch matching profiles. Please try again."
      );
    } finally {
      setIsLoadingStep2(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7ec] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl mb-10 text-[#111827] text-center tracking-wide drop-shadow-lg font-montserrat ">
          Relevan
          <span className="text-[#1f40ed] font-semibold">Seek</span>
        </h1>

        <SearchArea
          handleSubmit={handleSubmit}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          isLoadingStep1={isLoadingStep1}
          error={searchAreaError}
        />

        <JobDetails
          jobDetails={jobDetails}
          onConfirm={handleConfirm}
          error={jobDetailsError}
          isLoadingStep2={isLoadingStep2}
        />

        <MatchingProfiles profiles={profiles} />
      </div>
    </div>
  );
}
