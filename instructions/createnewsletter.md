
## Prompt

mutation CreateNewsletter {
  createNewsletter(config: {url: "test.com", summary_config: {size: "medium"}}) {
    newsletter_uuid
  }
}