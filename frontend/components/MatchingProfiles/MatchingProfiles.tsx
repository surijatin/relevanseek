import React from "react";
import ProfileCard from "@/components/ProfileCard/ProfileCard";
import { Profile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MatchingProfilesProps = {
  profiles: Profile[];
};

const MatchingProfiles: React.FC<MatchingProfilesProps> = ({ profiles }) => {
  if (!profiles.length) return null;

  return (
    <Card className="mb-8 bg-white shadow-lg border border-[#1f40ed]">
      <CardHeader>
        <CardTitle className="block text-lg font-bold text-[#111827] mb-2 tracking-wide font-montserrat">
          Matching Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        {profiles.map((profile) => (
          <ProfileCard key={profile.profile_id} profile={profile} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MatchingProfiles;
