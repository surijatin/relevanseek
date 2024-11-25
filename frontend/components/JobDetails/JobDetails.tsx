import { useEffect, useState } from "react";
import { Briefcase, Building, MapPin, Users, Loader2 } from "lucide-react";
import { JobDetails as JobDetailsType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type JobDetailsProps = {
  jobDetails: JobDetailsType | null;
  onConfirm: (updatedDetails: JobDetailsType) => void;
  error: string;
  isLoadingStep2: boolean;
};

const JobDetails = ({
  jobDetails,
  onConfirm,
  error,
  isLoadingStep2,
}: JobDetailsProps) => {
  const [editableDetails, setEditableDetails] = useState<JobDetailsType | null>(
    jobDetails
  );

  useEffect(() => {
    if (jobDetails) {
      setEditableDetails(jobDetails);
    }
  }, [jobDetails]);

  if (!editableDetails) return null;

  const handleChange = (field: keyof JobDetailsType, value: string) => {
    setEditableDetails((prevDetails) => ({
      ...prevDetails!,
      [field]: value,
    }));
  };

  const handleConfirm = () => {
    if (editableDetails) {
      onConfirm(editableDetails);
    }
  };

  return (
    <Card className="mb-8 bg-white shadow-lg border border-[#1f40ed]">
      <CardHeader>
        <CardTitle className="block text-lg font-bold text-[#111827] mb-2 tracking-wide font-montserrat">
          Job Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-[#1f40ed]" />
            <span className="text-[#111827]">Job Title:</span>
            <input
              type="text"
              value={editableDetails.target_role}
              onChange={(e) => handleChange("target_role", e.target.value)}
              className="ml-2 text-[111827] border border-[#7AB2D3] p-1 rounded font-semibold flex-grow"
            />
          </div>
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#1f40ed]" />
            <span className="text-[#111827]">Company:</span>
            <input
              type="text"
              value={editableDetails.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className="ml-2 text-[111827] border border-[#7AB2D3] p-1 rounded font-semibold flex-grow"
            />
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[#1f40ed]" />
            <span className="text-[#111827]">Location:</span>
            <input
              type="text"
              value={editableDetails.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="ml-2 text-[111827] border border-[#7AB2D3] p-1 rounded font-semibold flex-grow"
            />
          </div>
        </div>
        <div className="flex flex-col items-start mt-4">
          <span className="mr-2 text-[#111827]">Job Summary:</span>
          <span className="border border-[#4b5563] p-2 rounded mt-2 font-montserrat">
            {editableDetails.job_summary}
          </span>
        </div>
        <Button
          onClick={handleConfirm}
          disabled={isLoadingStep2}
          className="w-full mt-4 bg-[#1f40ed] hover:bg-[#4A628A] text-white transition-colors duration-300 text-lg py-2 px-4 font-semibold tracking-wide font-montserrat"
        >
          {isLoadingStep2 ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Finding profiles...
            </>
          ) : (
            <>
              <Users className="mr-2 h-5 w-5" /> Confirm & Find People
            </>
          )}
        </Button>
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

export default JobDetails;
