# Goal

I want to create a dialogue component - JobNewsletterStatus whose main goal would be presenting job newsletter creation status. There are two stages of the job:'summarization' and 'compilation'.  There is a service that will be executed every 2 seconds to update the job state.

## Flow description

When user select list of articles and click: Generate Newsletter the dialog with status should be displed. To get actual status the dialog should execute service every 2 secords.

## API documentation

``` typescript
query GetNewsletterJobStatus {
  getNewsletterJobStatus(jobUuid: "da5511b9-cb37-4a0f-a554-53495ee26da2") {
    status
    articleSummaries {
      status
      url
    }
  }
}
```

Result:

``` json
{
  "data": {
    "getNewsletterJobStatus": {
      "status": "completed",
      "articleSummaries": [
        {
          "status": "completed",
          "url": "https://leszno.naszemiasto.pl/zakupy-w-sieci-nigdy-nie-byly-latwiejsze-oto-najnowsze-trendy-w-e-commerce/ar/c3p2-27225743"
        },
        {
          "status": "completed",
          "url": "https://zaman.co.at/pl/news/cena-akcji-amazona-rewolucja-ai-czy-innowacje-wyniosa-ja-na-nowe-wyzyny/1301522/"
        }
      ]
    }
  }
}
```

Top level field: 'status' can have values:  Values like 'summarization', 'compilation', 'completed'. Field: articleSummaries can contains list of  articles which are being summariesed during 'summarization' stage. 