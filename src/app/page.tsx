"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy, Download, Youtube, FileText, Loader2, BarChart3, History, Settings, Home } from "lucide-react"

export default function HomePage() {
  const [url, setUrl] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const blogRef = useRef<HTMLDivElement>(null)
  const [totalGenerated, setTotalGenerated] = useState(0)

  const validateYoutubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    return regex.test(url)
  }

  const handleSubmit = async () => {
    if (!url) {
      setError("Please enter a YouTube URL")
      toast.error("Please enter a YouTube URL")
      return
    }

    if (!validateYoutubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      toast.error("Please enter a valid YouTube URL")
      return
    }

    setIsLoading(true)
    setError("")
    setBlogContent("")

    try {
      const response = await fetch("http://127.0.0.1:8000/generate_blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to generate blog")
      }

      const data = await response.json()
      setBlogContent(data.blog_content)
      setTotalGenerated((prev) => prev + 1)
      toast.success("Blog generated successfully")
    } catch (err: any) {
      setError(err.message || "An error occurred")
      toast.error(err.message || "An error occurred while generating the blog")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (blogContent) {
      navigator.clipboard.writeText(blogContent)
      toast.success("Copied to clipboard")
    }
  }

  const downloadBlog = () => {
    if (blogContent) {
      const element = document.createElement("a")
      const file = new Blob([blogContent], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = "blog-post.md"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success("Blog downloaded")
    }
  }

  const getWordCount = () => {
    if (!blogContent) return 0
    return blogContent.split(/\s+/).filter(Boolean).length
  }

  const formatBlogContent = (content: string) => {
    if (!content) return []

    return content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold mt-6 mb-4">
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-semibold mt-5 mb-3">
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg font-medium mt-4 mb-2">
            {line.substring(4)}
          </h3>
        )
      } else if (line.trim() === "") {
        return <div key={i} className="h-4"></div>
      } else {
        return (
          <p key={i} className="mb-3 leading-relaxed">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex h-14 items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Youtube className="h-6 w-6 text-red-600 mr-2" />
          <h1 className="font-semibold">YT Blog Generator</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                History
              </a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#" className="flex items-center">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </a>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <a href="#" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-40 border-b bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <div className="flex h-14 items-center px-4 md:px-6">
            <Youtube className="h-6 w-6 text-red-600 mr-2 md:hidden" />
            <h1 className="font-semibold md:hidden">YT Blog Generator</h1>
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Help
              </Button>
            </div>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGenerated}</div>
                <p className="text-xs text-muted-foreground">Blogs generated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Word Count</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getWordCount()}</div>
                <p className="text-xs text-muted-foreground">Words in current blog</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Generate Blog from YouTube</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1">
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-10"
                    />
                  </div>
                  <Button onClick={handleSubmit} disabled={isLoading} className="h-10">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Generate Blog"
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-4 mb-6 p-6 border rounded-lg">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-4/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-3/4"></div>
                  </div>
                )}

                {blogContent && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <h3 className="font-medium">Generated Blog Post</h3>
                        <Badge variant="outline" className="ml-2">
                          {getWordCount()} words
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadBlog} className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                      </TabsList>

                      <TabsContent value="preview" className="mt-0">
                        <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
                          <div ref={blogRef} className="prose prose-slate dark:prose-invert max-w-none">
                            {formatBlogContent(blogContent)}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="markdown" className="mt-0">
                        <div className="border rounded-lg p-6 bg-white dark:bg-slate-950">
                          <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap text-sm">
                            {blogContent}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}