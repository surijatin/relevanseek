import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Command, CornerDownLeft } from "lucide-react";

type SearchAreaProps = {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  isLoadingStep1: boolean;
  error: string;
};

const SearchArea: React.FC<SearchAreaProps> = ({
  handleSubmit,
  jobDescription,
  setJobDescription,
  isLoadingStep1,
  error,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isLoadingStep1 && jobDescription.trim()) {
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
  }, [isLoadingStep1, jobDescription]);

  return (
    <Card className="mb-8 bg-white shadow-lg border border-[#1f40ed]">
      <CardHeader>
        <CardTitle className="block text-lg font-bold text-[#111827] mb-2 tracking-wide font-montserrat">
          Job Description
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Enter job description here..."
            className="mb-4 border-[#4b5563] focus:border-[#111827] focus:ring-[#111827] font-montserrat"
            rows={6}
          />
          <Button
            type="submit"
            disabled={isLoadingStep1 || !jobDescription.trim()}
            className="w-full bg-[#1f40ed] hover:bg-[#4A628A] text-white transition-colors duration-300 text-lg py-3 font-semibold tracking-wide font-montserrat"
          >
            {isLoadingStep1 ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Job Description...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-5 w-5" />
                Find Matching Profiles{" "}
                <span className="text-sm ml-2 flex items-center">
                  (<Command /> + <CornerDownLeft />)
                </span>
              </>
            )}
          </Button>
        </form>
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mt-4 font-montserrat font-semibold"
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
