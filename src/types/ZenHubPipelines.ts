export interface ZenHubPipelines {
  pipelines: Array<{
    id: string;
    name: string;
    issues: Array<any>;
  }>
}
