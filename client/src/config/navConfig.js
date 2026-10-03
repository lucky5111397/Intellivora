import {
    Video,
    Sparkles,
    Users,
    FileText,
    HelpCircle,
    Code2,
    BarChart2,
    Briefcase,
    TrendingUp,
    Building,
} from "lucide-react";

export const navSections = [
    {
        key: "prepare",
        name: "Prepare",
        items: [
            {
                name: "DSA",
                description: "Practice Data Structures & Algorithms",
                icon: Code2,
                path: "/prepare/dsa",
                disabled: false,
            },
            {
                name: "System Design",
                description: "Master architecture & scalability",
                icon: BarChart2,
                path: "/prepare/system-design",
                disabled: false,
            },
            {
                name: "Technical Quiz",
                description: "Test your core CS knowledge",
                icon: HelpCircle,
                path: "/prepare/quiz",
                disabled: false,
            },
            {
                name: "SQL Practice",
                description: "Master database queries",
                icon: FileText,
                path: "/prepare/sql",
                disabled: false,
            },
            {
                name: "Coding Practice",
                description: "Solve programming challenges",
                icon: Code2,
                path: "/prepare/coding",
                disabled: false,
            },
        ],
    },
    {
        key: "assess",
        name: "Assess",
        items: [
            {
                name: "AI Interview",
                description: "Adaptive mock rounds with real-time feedback",
                icon: Video,
                path: "/interview",
                disabled: false,
            },
            {
                name: "Aptitude",
                description: "Timed quantitative, logical & verbal diagnostic tests",
                icon: Sparkles,
                path: "/aptitude",
                disabled: false,
            },
            {
                name: "Group Discussion",
                description: "Multi-agent conversational rounds with turn-taking telemetry",
                icon: Users,
                path: "/gd",
                disabled: false,
            },
            {
                name: "Mock Placement",
                description: "Full mock placement drives",
                icon: Briefcase,
                path: "/assess/placement",
                disabled: false,
            },
            {
                name: "Interview Replay",
                description: "Review your past interviews",
                icon: Video,
                path: "/assess/replay",
                disabled: false,
            },
        ],
    },
    {
        key: "career",
        name: "Career",
        items: [
            {
                name: "ATS / Resume",
                description: "Deep JD-resume matching score and bullet optimization",
                icon: FileText,
                path: "/resume",
                disabled: false,
            },
            {
                name: "JD Analyzer",
                description: "Analyze job descriptions against your profile",
                icon: FileText,
                path: "/career/jd-analyzer",
                disabled: false,
            },
            {
                name: "Career Roadmap",
                description: "Plan your career trajectory",
                icon: TrendingUp,
                path: "/career/roadmap",
                disabled: false,
            },
            {
                name: "Company Preparation",
                description: "Prepare for specific companies",
                icon: Building,
                path: "/career/company-preparation",
                disabled: false,
            },
            {
                name: "Job Tracker",
                description: "Track your job applications",
                icon: Briefcase,
                path: "/career/job-tracker",
                disabled: false,
            },
        ],
    },
];

export const directNavLinks = [
    {
        name: "Pricing",
        path: "/pricing",
        requiresAuth: false,
    },
];
