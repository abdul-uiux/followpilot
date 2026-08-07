import { readFile } from "node:fs/promises";
import path from "node:path";
import FollowPilotReview from "./followpilot-review";
import type { ExpectedResult, FixtureRecord } from "./followpilot-types";

export default async function Home() {
  const fixtureDirectory = path.join(process.cwd(), "fixtures", "case-01-clear-mixed");
  const [transcript, fixtureSource, expectedSource] = await Promise.all([
    readFile(path.join(fixtureDirectory, "transcript.txt"), "utf8"),
    readFile(path.join(fixtureDirectory, "fixture-record.json"), "utf8"),
    readFile(path.join(fixtureDirectory, "expected-result.json"), "utf8"),
  ]);

  return (
    <FollowPilotReview
      transcript={transcript}
      fixture={JSON.parse(fixtureSource) as FixtureRecord}
      expected={JSON.parse(expectedSource) as ExpectedResult}
    />
  );
}
