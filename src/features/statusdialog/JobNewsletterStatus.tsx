import React from "react"
import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNewsletterJobStatus } from "./useNewsletterJobStatus"
import { useDataLayer } from '@/hooks/useDataLayer'

interface JobNewsletterStatusProps {
  jobUuid: string | null
  onClose: () => void
  user: any
}

export const JobNewsletterStatus: React.FC<JobNewsletterStatusProps> = ({ jobUuid, onClose, user }) => {
  const [open, setOpen] = useState<boolean>(!!jobUuid)
  const { jobStatus, error, getStatusText, getProgressPercentage } = useNewsletterJobStatus(jobUuid)

  // Use the dataLayer hook at the component level
  useDataLayer({
    pagePath: '/wait',
    pageUrl: 'https://newsletter.creoscope.com/wait',
    previousPageUrl: 'https://newsletter.creoscope.com/list',
    pageTitle: 'Nwsl wait',
    user: user
  });

  useEffect(() => {
    setOpen(!!jobUuid)
  }, [jobUuid])

  const handleDialogClose = () => {
    setOpen(false)
    onClose()
  }

  // Function to truncate URL for display
  const truncateUrl = (url: string, maxLength = 40) => {
    if (!url) return ""
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      
      if (url.length <= maxLength) return url
      
      // Show domain + beginning of path with ellipsis
      const pathPart = urlObj.pathname.length > 15 
        ? urlObj.pathname.substring(0, 12) + "..." 
        : urlObj.pathname
        
      return `${domain}${pathPart}`
    } catch (e) {
      // If URL parsing fails, do simple truncation
      return url.length > maxLength ? url.substring(0, maxLength - 3) + "..." : url
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Newsletter Generation</DialogTitle>
          <DialogDescription className="text-muted-foreground">{getStatusText()}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {error ? (
            <div className="flex items-center gap-2 p-4 border rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Progress indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Article status list */}
              {jobStatus?.status === "summarization" && jobStatus.articleSummaries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Article Summaries</h4>
                  <ScrollArea className="h-[180px] rounded-md border p-2">
                    <div className="space-y-2 pr-3">
                      {jobStatus.articleSummaries.map((article, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[calc(100%-80px)]">
                            {article.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            )}
                            <span 
                              className="truncate text-sm" 
                              title={article.url}
                            >
                              {truncateUrl(article.url)}
                            </span>
                          </div>
                          <div
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                              article.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {article.status === "completed" ? "Done" : "Processing"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Completed message */}
              {jobStatus?.status === "completed" && (
                <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                  <p className="font-medium text-green-800 dark:text-green-400">
                    Newsletter has been successfully generated!
                  </p>
                  <Button
                    variant="outline"
                    className="gap-2 border-green-300 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/50"
                    asChild
                  >
                    <a href={`/newsletter/${jobUuid}`} target="_blank" rel="noopener noreferrer">
                      <span>View Newsletter</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default JobNewsletterStatus