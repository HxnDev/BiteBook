import { Page } from "@/components/layout/Page";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function NotFound() {
  return (
    <Page>
      <PlaceholderPage
        eyebrow="404"
        title="This page is off the menu."
        body="The recipe you're after doesn't exist — or hasn't been cooked up yet."
        phase="Not found"
      />
    </Page>
  );
}
