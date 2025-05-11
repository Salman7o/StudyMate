import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import TutorProfile from "@/components/tutors/TutorProfile";
import { TutorProfile as ITutorProfile } from "@/lib/types";

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const tutorId = parseInt(id);
  
  const { data: tutorData, isLoading } = useQuery<ITutorProfile & { reviews: any[] }>({
    queryKey: [`/api/tutors/${tutorId}`],
    enabled: !isNaN(tutorId),
  });
  
  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Tutor Profile | StudyBuddy"
            : tutorData
              ? `${tutorData.user?.firstName} ${tutorData.user?.lastName} | StudyBuddy`
              : "Tutor Not Found | StudyBuddy"
          }
        </title>
        <meta 
          name="description" 
          content={
            tutorData
              ? `${tutorData.user?.firstName} ${tutorData.user?.lastName} is a ${tutorData.program} tutor specializing in ${tutorData.subjects.join(", ")}. Book a tutoring session today.`
              : "View tutor profiles, read reviews, and book sessions with qualified tutors on StudyBuddy."
          }
        />
      </Helmet>
      
      {!isNaN(tutorId) && <TutorProfile tutorId={tutorId} />}
    </>
  );
}
