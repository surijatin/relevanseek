import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import { Profile } from "@/types";

const ProfileCard = ({ profile }: { profile: Profile }) => (
  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 h-80 flex flex-col justify-between">
    <CardHeader className="flex flex-col items-center bg-[#DFF2EB] rounded-t-lg p-4">
      {profile.profile_photo ? (
        <Image
          src={profile.profile_photo}
          alt={`${profile.name}'s profile picture`}
          width={64}
          height={64}
          className="rounded-full mb-2"
        />
      ) : (
        <UserCircle className="h-16 w-16 text-[#7AB2D3] mb-2" />
      )}
      <CardTitle className="text-[#4A628A]">{profile.name}</CardTitle>
      <p className="text-sm text-[#7AB2D3]">{profile.current_position}</p>
    </CardHeader>
    <CardContent className="flex flex-col justify-between p-4 flex-grow">
      <p className="text-sm text-[#4A628A] mb-2">{profile.headline}</p>
      <div className="flex items-center mb-4">
        <span className="font-semibold text-[#4A628A] mr-2">Relevancy:</span>
        <div className="bg-[#DFF2EB] h-2 flex-grow rounded-full overflow-hidden">
          <div
            className="bg-[#7AB2D3] h-full rounded-full"
            style={{ width: `${profile.relevance_score * 10}%` }}
          />
        </div>
        <span className="ml-2 text-[#4A628A] font-semibold">
          {profile.relevance_score * 10}%
        </span>
      </div>
      <a
        href={profile.profile_link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-center bg-[#7AB2D3] text-white py-2 px-4 rounded-lg hover:bg-[#4A628A] transition-colors duration-300"
      >
        Go to LinkedIn Profile
      </a>
    </CardContent>
  </Card>
);

export default ProfileCard;
