import bodyParser from "body-parser";
import express from "express";
import {PullRequest} from "github-webhook-event-types";
import {WebhookService} from "./src/WebhookService";

const port = process.env.PORT || 3000;
const zenhubToken = process.env.ZENHUB_TOKEN || "";
const prCreatePipeline = process.env.PR_CREATE_PIPELINE || "";
const prMergePipeline = process.env.PR_MERGE_PIPELINE || "";

function startServer() {
  const webhookService = new WebhookService({
    zenhubToken,
    zenhubPipelineWhenPRCreated: prCreatePipeline,
    zenhubPipelineWhenPRClosed: prMergePipeline,
  });

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use("/", async (req, res) => {
    const hook: PullRequest = JSON.parse(req.body.payload);
    await webhookService.process(hook);
    res.end();
  });

  app.listen(port, () => console.log(`[WebhookEngine] Webhook is listening ${port}`));
}

if (!zenhubToken || zenhubToken === "") {
  console.error("Error: Missing the ZENHUB_TOKEN");
} else if (!prCreatePipeline || prCreatePipeline === "") {
  console.error("Error: Missing the PR_CREATE_PIPELINE");
} else if (!prMergePipeline || prMergePipeline === "") {
  console.error("Error: Missing the PR_MERGE_PIPELINE");
} else {
  console.log("ZENHUB_TOKEN =", zenhubToken);
  console.log("PR_CREATE_PIPELINE =", prCreatePipeline);
  console.log("PR_MERGE_PIPELINE =", prMergePipeline);
  startServer();
}
