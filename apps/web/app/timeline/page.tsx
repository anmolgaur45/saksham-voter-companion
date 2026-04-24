import type { Metadata } from "next";
import { getTimeline } from "@/app/chat/actions";
import { TimelineWithLanguage } from "./timeline-data-client";

export const metadata: Metadata = {
  title: "Election Timeline · Saksham",
  description: "The 13 phases of an Indian General Election, from voter roll revision to declaration of results.",
};

export default async function TimelinePage() {
  const phases = await getTimeline();
  return <TimelineWithLanguage initialPhases={phases} />;
}
