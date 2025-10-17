import { useState } from "react";

interface ExperienceCardProps {
  experienceTitle: string;
  experienceDescription: string;
  experienceDetails?: string[];
}

const ExperienceCard = ({
  experienceTitle,
  experienceDescription,
  experienceDetails,
}: ExperienceCardProps) => {
  const [seeMore, setSeeMore] = useState(false);

  return (
    <div className="flex flex-col bg-gray-100 rounded-md p-3 max-w-[22.5rem] min-h-[10rem]">
      <div className="font-semibold">{experienceTitle}</div>
      <div className="text-gray-600">{experienceDescription}</div>
      {seeMore && (
        <div className="text-gray-600 mt-2 space-y-1">
          {Array.isArray(experienceDetails) ? (
            experienceDetails.map((d, i) => (
              <div key={i} className="text-sm">
                {d}
              </div>
            ))
          ) : (
            <div className="text-sm">{experienceDetails}</div>
          )}
        </div>
      )}
      <div className="mt-auto pt-3">
        <button
          onClick={() => setSeeMore((s) => !s)}
          className="text-indigo-600 hover:underline text-sm"
          aria-expanded={seeMore}
        >
          {seeMore ? "See Less" : "See More"}
        </button>
      </div>
    </div>
  );
};

export default ExperienceCard;
