import FollowPilotReview from "../followpilot-review";
import { emptyReviewData } from "../lib/empty-review";

export default function Onboarding() {
  const { fixture, expected } = emptyReviewData();
  return (
    <FollowPilotReview
      transcript=""
      fixture={fixture}
      expected={expected}
      showOnboarding
    />
  );
}
