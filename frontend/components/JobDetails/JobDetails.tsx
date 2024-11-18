import { Briefcase, Building, MapPin } from "lucide-react";
import { JobDetails as JobDetailsType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type JobDetailsProps = {
  jobDetails: JobDetailsType | null;
};

const JobDetails = ({ jobDetails }: JobDetailsProps) => {
  if (!jobDetails) return null;

  return (
    <Card className="mb-8 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#4A628A]">
          Job Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-[#7AB2D3]" />
            <span className="font-semibold text-[#4A628A]">Job Title:</span>
            <span className="ml-2 text-[#7AB2D3]">
              {jobDetails.target_role}
            </span>
          </div>
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#7AB2D3]" />
            <span className="font-semibold text-[#4A628A]">Company:</span>
            <span className="ml-2 text-[#7AB2D3]">
              {jobDetails.company_name}
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-[#7AB2D3]" />
            <span className="font-semibold text-[#4A628A]">Location:</span>
            <span className="ml-2 text-[#7AB2D3]">{jobDetails.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-start mt-4">
          <span className="mr-2 font-semibold text-[#4A628A]">
            Job Summary:
          </span>
          <span className="text-[#4A628A] border border-[#7AB2D3] p-2 rounded mt-2">
            {jobDetails.job_summary}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDetails;
