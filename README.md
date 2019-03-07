# github-hook-for-zenhub

### Setup zenhub pipeline

For example, you might set `Backlog`, `In Progress`, `Resolved`, `Closed`


### Start the server
```yml
version: '3'
services:
  zenhubhook:
    image: echoulen/github-hook-for-zenhub:latest
    ports:
      - "3000:3000"
    environment:
      - ZENHUB_TOKEN=123
      - PR_CREATE_PIPELINE=In Progress
      - PR_MERGE_PIPELINE=Resolved
```

### Webhook configuration

- Payload URL
`YOURDOMAIN:3000`

- Content type `application/x-www-form-urlencoded`

- Select the `Let me select individual events` | `Pull requests`

- Check the `Active`
