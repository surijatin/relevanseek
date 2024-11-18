import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Command, CornerDownLeft } from "lucide-react";

type SearchAreaProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  isLoadingStep1: boolean;
  isLoadingStep2: boolean;
  error: string;
};

const SearchArea: React.FC<SearchAreaProps> = ({
  handleSubmit,
  jobDescription,
  setJobDescription,
  isLoadingStep1,
  isLoadingStep2,
  error,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isLoadingStep1 && !isLoadingStep2 && jobDescription.trim()) {
          const form = document.querySelector("form");
          if (form) {
            form.dispatchEvent(
              new Event("submit", { cancelable: true, bubbles: true })
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoadingStep1, isLoadingStep2, jobDescription]);

  return (
    <Card className="mb-8 bg-white shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="jobDescription"
            className="block text-md font-bold text-[#4A628A] mb-2"
          >
            Job Description
          </label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter job description here..."
            className="mb-4 border-[#B9E5E8] focus:border-[#7AB2D3] focus:ring-[#7AB2D3]"
            rows={6}
          />
          <Button
            type="submit"
            disabled={
              isLoadingStep1 || isLoadingStep2 || !jobDescription.trim()
            }
            className="w-full bg-[#7AB2D3] hover:bg-[#4A628A] text-white transition-colors duration-300 text-lg py-3 font-bold"
          >
            {isLoadingStep1 || isLoadingStep2 ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isLoadingStep1
                  ? "Analyzing Job Description..."
                  : "Finding Matches..."}
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-5 w-5" />
                Find Matching Profiles{" "}
                <span className="text-sm text-[#4A628A] ml-2 flex items-center">
                  (<Command /> + <CornerDownLeft />)
                </span>
              </>
            )}
          </Button>
        </form>
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mt-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchArea;
