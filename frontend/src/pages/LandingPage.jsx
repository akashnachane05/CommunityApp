import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Users, Brain, Calendar, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// Helper component for animated stats
const AnimatedStat = ({ number, label }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (typeof number !== 'number' || isNaN(number)) {
            setCount(0); return;
        }
        let frame = 0;
        const totalFrames = 50;
        const counter = setInterval(() => {
            frame++;
            setCount(Math.round((number / totalFrames) * frame));
            if (frame === totalFrames) clearInterval(counter);
        }, 20);
        return () => clearInterval(counter);
    }, [number]);
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {count}+
            </div>
            <div className="text-gray-600 text-lg">{label}</div>
        </div>
    );
};

// Logo Component for reusability
const VitaaLogo = () => (
    <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
        </div>
        <span className="text-2xl font-bold text-gray-900">VITAA</span>
    </div>
);

export default function LandingPage() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicStats = async () => {
            try {
                const res = await api.get('/stats/public');
                setStats(res.data);
            } catch (error) { console.error("Could not fetch public stats.", error); } 
            finally { setLoading(false); }
        };
        fetchPublicStats();
    }, []);

    const features = [
        { icon: <Brain />, title: "AI-Powered Mentorship", description: "Our smart algorithm connects you with the perfect VIT alumni based on your career goals and field of interest." },
        { icon: <Users />, title: "Exclusive Network", description: "Access a powerful, private network of VIT Pune students and accomplished alumni from top companies worldwide." },
        { icon: <Calendar />, title: "Career Events", description: "Participate in webinars, workshops, and hiring events hosted by alumni who are leaders in their industries." },
    ];
    
    const testimonials = [
        { name: "Priya Sharma", role: "SDE @ Google", content: "The mentorship I received through VITAA was instrumental in my journey from campus to a top tech company. Invaluable guidance!" },
        { name: "Rohan Deshmukh", role: "Product Manager @ Microsoft", content: "As an alumnus, giving back to the VIT Pune community has been incredibly rewarding. This platform makes it seamless." },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <VitaaLogo />
                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="hover:text-blue-600 font-medium">Features</a>
                        <a href="#testimonials" className="hover:text-blue-600 font-medium">Testimonials</a>
                        <Link to="/login"><Button variant="ghost">Login</Button></Link>
                        <Link to="/register"><Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Join Now</Button></Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="relative py-24 px-4 text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-white opacity-90"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">Where VIT Pune's Legacy<br /> Shapes its Future.</h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">The exclusive platform for Vishwakarma Institute of Technology students and alumni to connect, mentor, and grow.</p>
                        <Link to="/register"><Button size="lg" className="text-lg px-8 py-4 rounded-full shadow-lg">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                    </div>
                </section>

                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-y-12">
                        {loading ? <p className="col-span-full text-center">Loading community stats...</p> : <>
                            <AnimatedStat number={stats.alumniCount} label="Alumni Network" />
                            <AnimatedStat number={stats.studentCount} label="Students Engaged" />
                            <AnimatedStat number={stats.mentorshipsCount} label="Mentorships" />
                            <AnimatedStat number={stats.eventsCount} label="Hosted Events" />
                        </>}
                    </div>
                </section>

                <section id="features" className="py-24 px-4 bg-gray-50">
                    <div className="container mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-4">A Platform Built for Success</h2>
                        <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">From AI-driven connections to exclusive career opportunities, everything you need is right here.</p>
                        <div className="grid md:grid-cols-3 gap-10">
                            {features.map((feature) => (
                                <div key={feature.title} className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto">{feature.icon}</div>
                                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="testimonials" className="py-24 px-4">
                    <div className="container mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Straight from the VIT Pune Family</h2>
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {testimonials.map((t) => (
                                <Card key={t.name} className="bg-white border-0 shadow-xl">
                                    <CardContent className="p-8">
                                        <div className="flex items-center mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
                                        <p className="text-gray-700 italic text-lg mb-6">"{t.content}"</p>
                                        <div className="flex items-center space-x-4">
                                            {/* ✅ Using the gradient logo for testimonials */}
                                            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-2xl">{t.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">{t.name}</div>
                                                <div className="text-gray-600">{t.role}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                   
                    <p className="text-gray-400 my-8 max-w-md mx-auto">Connecting VIT Pune's past, present, and future generations through technology and mentorship.</p>
                    <Link to="/register"><Button size="lg" variant="secondary" className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Sign Up for Free</Button></Link>
                </div>
            </footer>
        </div>
    );
}