import { useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Search, Filter, BookOpen, Star, Download } from "lucide-react"

export default function StudentResources() {
  const [learningResources] = useState([
    {
          id: 1,
          title: "Complete React.js Course",
          author: "Alumni Network",
          authorRole: "Senior Developers",
          type: "Video Course",
          duration: "8 hours",
          rating: 4.8,
          downloads: 1240,
          category: "Tech",
          level: "Intermediate",
          description: "Master React.js with real-world projects and examples",
        },
        {
          id: 2,
          title: "System Design Interview Guide",
          author: "Senior Engineers",
          authorRole: "FAANG Companies",
          type: "PDF Guide",
          duration: "45 pages",
          rating: 4.9,
          downloads: 892,
          category: "Career",
          level: "Advanced",
          description: "Comprehensive guide to ace system design interviews",
        },
        {
          id: 3,
          title: "Data Structures & Algorithms",
          author: "CS Alumni",
          authorRole: "Software Engineers",
          type: "Interactive Course",
          duration: "12 hours",
          rating: 4.7,
          downloads: 2156,
          category: "Academic",
          level: "Beginner",
          description: "Master DSA concepts with coding practice and examples",
        },
        {
          id: 4,
          title: "Machine Learning Fundamentals",
          author: "Data Science Alumni",
          authorRole: "ML Engineers",
          type: "Video Series",
          duration: "15 hours",
          rating: 4.6,
          downloads: 1876,
          category: "Tech",
          level: "Intermediate",
          description: "Learn ML concepts from basics to advanced applications",
        },
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Resources</h1>
        <p className="text-xl text-gray-600">
          Alumni-contributed study materials and guides
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search resources..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resource Cards */}
      <div className="grid gap-6">
        {learningResources.map((resource) => (
          <Card
            key={resource.id}
            className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Left: Resource Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{resource.author}</span>
                      <span>•</span>
                      <span>{resource.type}</span>
                      <span>•</span>
                      <span>{resource.duration}</span>
                      <div className="flex items-center ml-2">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{resource.rating}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: Downloads + Action */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{resource.downloads} downloads</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {resource.level}
                    </Badge>
                  </div>
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
