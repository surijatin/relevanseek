import { Card } from "@/components/ui/card";
import { UserCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";

const ProfileCard = ({ profile }: { profile: Profile }) => (
  <Card className="flex flex-col sm:flex-row items-center p-4 gap-4 w-full bg-[#f7faff] shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[#4b5563] mb-4">
    <div className="rounded-full overflow-hidden flex-shrink-0 w-36 h-36">
      {profile.profile_photo ? (
        <Image
          src={profile.profile_photo}
          alt={`${profile.name}'s profile picture`}
          width={144}
          height={144}
          className="object-cover"
        />
      ) : (
        <UserCircle className="h-36 w-36 text-[#111827]" />
      )}
    </div>
    <div className="flex-grow space-y-2 text-center sm:text-left">
      <h2 className="text-xl font-bold text-[#111827] font-montserrat">
        {profile.name}
      </h2>
      <p className="text-base font-semibold text-[#111827] font-montserrat">
        {profile.current_position}
      </p>
      <p className="text-sm font-semibold text-[#111827] font-montserrat">
        {profile.headline}
      </p>
      <p className="text-sm text-[#111827]">
        <span className="underline">Reasoning:</span> {profile.reasoning}
      </p>
      <p className="text-sm text-[#111827]">
        <span className="underline">Potential Emails:</span>{" "}
        {profile.potential_emails.join(", ")}
      </p>
      <div className="space-y-1 w-1/2">
        <p className="text-xs text-[#4b5563]">
          Relevancy Score: {profile.relevance_score} / 10
        </p>
        <div className="bg-[#ffffff] h-2 rounded-full overflow-hidden border border-[#4b5563]">
          <div
            className="bg-[#1f40ed] h-full rounded-full"
            style={{ width: `${profile.relevance_score * 10}%` }}
          />
        </div>
      </div>
    </div>
    <div className="flex-shrink-0">
      <Button asChild className="bg-[#1f40ed]">
        <a
          href={profile.profile_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-white py-2 px-4 rounded-lg"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          LinkedIn
        </a>
      </Button>
    </div>
  </Card>
);

export default ProfileCard;
