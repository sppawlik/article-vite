import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Dashboard() {
    const articles = [
        { id: 1, title: "The Future of AI", description: "Exploring the potential impact of artificial intelligence on various industries.", category: "Technology" },
        { id: 2, title: "Sustainable Living", description: "Tips and tricks for reducing your carbon footprint and living a more eco-friendly life.", category: "Lifestyle" },
        { id: 3, title: "Financial Planning 101", description: "Essential strategies for managing your money and planning for the future.", category: "Finance" },
        { id: 4, title: "The Art of Productivity", description: "Techniques to boost your productivity and achieve your goals faster.", category: "Self-improvement" },
        { id: 5, title: "Travel on a Budget", description: "How to explore the world without breaking the bank.", category: "Travel" },
    ]

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                </div>
                <nav className="mt-4">
                    <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Home</a>
                    <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Articles</a>
                    <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Categories</a>
                    <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">Settings</a>
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-hidden">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Newsletter Curator Dashboard</h1>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle>{article.title}</CardTitle>
                                    <CardDescription>{article.category}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{article.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </main>
        </div>
    )
}