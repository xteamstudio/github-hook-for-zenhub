export interface GithubPRHook {
  action: "assigned" | "unassigned" | "review_requested"
    | "review_request_removed" | "labeled" | "unlabeled"
    | "opened" | "edited" | "closed" | "reopened";
  pull_request: {
    merged: boolean;
    title: string;
    body: string;
  }
  repository: {
    id: number;
  }
}
