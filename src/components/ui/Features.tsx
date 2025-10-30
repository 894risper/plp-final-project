import { FileSearch, TrendingUp, Users, Shield, BarChart3, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
    {
        icon: FileSearch,
        title: "Contract Monitoring",
        description: "Track and analyze government procurement contracts in real-time with comprehensive data insights.",
    },
    {
        icon: AlertTriangle,
        title: "Anomaly Detection",
        description: "Advanced algorithms automatically flag suspicious contracts and potential corruption indicators.",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Visualize trends, patterns, and statistics with powerful data visualization tools.",
    },
    {
        icon: Users,
        title: "Vendor Tracking",
        description: "Monitor vendor relationships, contract history, and performance metrics across ministries.",
    },
    {
        icon: TrendingUp,
        title: "Transparency Reports",
        description: "Generate comprehensive reports to promote accountability and public transparency.",
    },
    {
        icon: Shield,
        title: "Secure & Reliable",
        description: "Enterprise-grade security ensuring data integrity and protection of sensitive information.",
    },
];

const Features = () => {
    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        Powerful Features for Transparency
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Everything you need to monitor government procurement and fight corruption through data.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-border transition-all hover:shadow-lg">
                            <CardContent className="p-6">
                                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
