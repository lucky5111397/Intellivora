import HeroSection from "../components/dashboard/HeroSection";
import StatsCards from "../components/dashboard/StatsCards";
import QuickActions from "../components/dashboard/QuickActions";
import RecentInterviews from "../components/dashboard/RecentInterviews";
import RecentResumes from "../components/dashboard/RecentResumes";
import AIInsights from "../components/dashboard/AIInsights";

const Dashboard = () => {
    return (
        <div className="space-y-8">
            <HeroSection />

            <QuickActions />

            <StatsCards />

            <RecentInterviews />

            <RecentResumes />
            <AIInsights />
        </div>
    );
};

export default Dashboard;