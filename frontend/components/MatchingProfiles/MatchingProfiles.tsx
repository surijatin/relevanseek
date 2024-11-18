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
    <Card className="mb-8 bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#4A628A]">
          Matching Profiles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.profile_id} profile={profile} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingProfiles;
