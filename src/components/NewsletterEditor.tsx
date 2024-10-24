import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CornerDownLeft,
  Mic,
  Paperclip,
} from "lucide-react"
import { Article } from "@/api/articleService"

interface NewsletterEditorProps {
  loading?: boolean;
  newsletterId: string | null;
  error: string | null;
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ loading, newsletterId, error }) => {
  return (
    <main className="grid flex-1 gap-4 overflow-auto p-4">
      <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
        <Badge variant="outline" className="absolute right-3 top-3">
          {loading ? "Loading..." : newsletterId ? `Newsletter ID: ${newsletterId}` : "Output"}
        </Badge>
        <div className="flex-1 overflow-auto">
          {error && (
            <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default NewsletterEditor
