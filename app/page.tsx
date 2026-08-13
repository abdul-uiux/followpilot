import FollowPilotReview from "./followpilot-review";
import { emptyReviewData } from "./lib/empty-review";
import { sampleExpected, sampleFixture, sampleTranscript } from "./lib/sample-review";

export default async function Home({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const { sample } = await searchParams;
  if (sample === "1") {
    return <FollowPilotReview transcript={sampleTranscript} fixture={sampleFixture} expected={sampleExpected} sampleReview />;
  }
  const { fixture, expected } = emptyReviewData();
  return (
    <FollowPilotReview
      transcript=""
      fixture={fixture}
      expected={expected}
    />
  );
}
