import axios from "axios";
import {PullRequest} from "github-webhook-event-types";
import {List, Set} from "immutable";
import issueRegex from 'issue-regex';
import {ZenHubPipelines} from "./types/ZenHubPipelines";

interface WebhookServiceProps {
  zenhubToken: string;
  zenhubPipelineWhenPRCreated: string;
  zenhubPipelineWhenPRClosed: string;
}

export class WebhookService {
  private baseUrl = "https://api.zenhub.io";
  private headers = {
    "X-Authentication-Token": "",
    "Content-Type": "application/json",
  };

  private readonly zenhubPipelineWhenPRCreated: string;
  private readonly zenhubPipelineWhenPRClosed: string;

  constructor(props: WebhookServiceProps) {
    const {zenhubToken, zenhubPipelineWhenPRCreated, zenhubPipelineWhenPRClosed} = props;
    this.headers["X-Authentication-Token"] = zenhubToken;
    this.zenhubPipelineWhenPRCreated = zenhubPipelineWhenPRCreated;
    this.zenhubPipelineWhenPRClosed = zenhubPipelineWhenPRClosed;
  }

  public async process(hook: PullRequest): Promise<void> {
    const repositoryId = hook.repository.id;
    const issueIds = WebhookService.getAllIssuesIds(hook);
    let pipelineId = null;
    if (hook.action === "opened" || hook.action === "reopened") {
      pipelineId = await this.getPipelineId(repositoryId, this.zenhubPipelineWhenPRCreated);
    } else if (hook.action === "closed" && hook.pull_request.merged === true) {
      pipelineId = await this.getPipelineId(repositoryId, this.zenhubPipelineWhenPRClosed);
    }
    pipelineId && issueIds.forEach(async (issueId: string) => {
      await this.changeIssueStatus(repositoryId, issueId, pipelineId);
    });
  }

  public async changeIssueStatus(repoId: number, issueId: string, pipelineId: string): Promise<void> {
    await axios.post(
      `${this.baseUrl}/p1/repositories/${repoId}/issues/${issueId}/moves`,
      {pipeline_id: pipelineId, position: "top"},
      {headers: this.headers},
    );
  }

  private async getPipelineId(repoId: number, status: string): Promise<string> {
    const res = await axios.get(
      `${this.baseUrl}/p1/repositories/${repoId}/board`,
      {headers: this.headers},
    );
    const zenhubPipelines: ZenHubPipelines = res.data;
    const pipeline = List(zenhubPipelines.pipelines).find((pipeline) => pipeline.name === status);
    return pipeline ? pipeline.id : null;
  }

  private static getAllIssuesIds(hook: PullRequest): Set<string> {
    const issues = List<string>(hook.pull_request.title.match(issueRegex()))
      .concat(List(hook.pull_request.body.match(issueRegex())))
      .map((issue) => issue.replace("#", ""));
    return Set<string>(issues.toArray());
  }
}
