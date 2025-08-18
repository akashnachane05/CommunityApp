import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Progress } from "../../components/ui/progress"
import {
  Users,
  Calendar,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Award,
  Bell,
  Search,
  Plus,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push("/auth/login")
    }
  }, [router])

  if (!user) {
    return <div>Loading...</div>
  }

  const isAlumni = user.type === "alumni"
  const isStudent = user.type === "student"

  const upcomingEvents = [
    {
      id: 1,
      title: "Career Development Workshop",
      date: "2024-01-15",
      time: "2:00 PM",
      type: "Workshop",
      attendees: 45,
    },
    {
      id: 2,
      title: "Tech Talk: AI in Industry",
      date: "2024-01-18",
      time: "6:00 PM",
      type: "Webinar",
      attendees: 120,
    },
    {
      id: 3,
      title: "Alumni Networking Mixer",
      date: "2024-01-22",
      time: "7:00 PM",
      type: "Networking",
      attendees: 80,
    },
  ]

  const recentMatches = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Senior Software Engineer",
      company: "Google",
      matchScore: 95,
      skills: ["React", "Node.js", "Python"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      matchScore: 88,
      skills: ["Product Strategy", "Analytics", "Leadership"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Data Scientist",
      company: "Netflix",
      matchScore: 92,
      skills: ["Machine Learning", "Python", "Statistics"],
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const mentorshipPrograms = [
    {
      id: 1,
      title: "Full Stack Development Mentorship",
      mentor: "John Doe",
      duration: "3 months",
      participants: 12,
      progress: 65,
      status: "Active",
    },
    {
      id: 2,
      title: "Career Transition Guidance",
      mentor: "Jane Smith",
      duration: "2 months",
      participants: 8,
      progress: 30,
      status: "Active",
    },
  ]

  const quickStats = isStudent
    ? [
        { label: "Mentor Matches", value: "3", icon: <Users className="h-4 w-4" /> },
        { label: "Webinars Attended", value: "12", icon: <Calendar className="h-4 w-4" /> },
        { label: "Resources Accessed", value: "28", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Messages", value: "45", icon: <MessageCircle className="h-4 w-4" /> },
      ]
    : [
        { label: "Students Mentored", value: "8", icon: <Users className="h-4 w-4" /> },
        { label: "Webinars Hosted", value: "5", icon: <Calendar className="h-4 w-4" /> },
        { label: "Resources Shared", value: "15", icon: <BookOpen className="h-4 w-4" /> },
        { label: "Profile Views", value: "156", icon: <TrendingUp className="h-4 w-4" /> },
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900">VIITAA</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/mentorship" className="text-gray-600 hover:text-blue-600">
                  Mentorship
                </Link>
                <Link href="/webinars" className="text-gray-600 hover:text-blue-600">
                  Webinars
                </Link>
                <Link href="/resources" className="text-gray-600 hover:text-blue-600">
                  Resources
                </Link>
                <Link href="/community" className="text-gray-600 hover:text-blue-600">
                  Community
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">
            {isStudent
              ? "Continue your learning journey and connect with amazing mentors."
              : "Help shape the next generation of VIIT graduates."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Powered Matches */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {isStudent ? "Recommended Mentors" : "Potential Mentees"}
                  </CardTitle>
                  <CardDescription>AI-powered matches based on your profile and interests</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={match.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{match.name}</h4>
                        <p className="text-sm text-gray-600">
                          {match.role} at {match.company}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {match.skills.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600 mb-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{match.matchScore}% match</span>
                      </div>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentorship Programs */}
            {isStudent && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Active Mentorship Programs
                    </CardTitle>
                    <CardDescription>Track your progress in ongoing mentorship programs</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Join Program
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentorshipPrograms.map((program) => (
                    <div key={program.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{program.title}</h4>
                        <Badge variant={program.status === "Active" ? "default" : "secondary"}>{program.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {program.participants} participants
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {program.duration}
                        </span>
                        <span>Mentor: {program.mentor}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{program.progress}%</span>
                        </div>
                        <Progress value={program.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New mentor match found</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Completed "React Fundamentals" resource</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Registered for "AI in Industry" webinar</p>
                      <p className="text-xs text-gray-600">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{event.attendees} attending</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {event.date} at {event.time}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isStudent ? (
                  <>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Find a Mentor
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Join Webinar
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Resources
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask AI Assistant
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View Mentees
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Webinar
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Share Resource
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Create Program
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
                <CardDescription>Complete your profile to get better matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Profile Strength</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Basic info completed
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      Skills added
                    </div>
                    <div className="flex items-center text-yellow-600">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></div>
                      Add profile photo
                    </div>
                    <div className="flex items-center text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Verify with blockchain
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
