import { Search, Database, Bell, FileBarChart } from "lucide-react";

const steps = [
    {
        icon: Database,
        title: "Data Collection",
        description: "Aggregate procurement data from multiple government sources and ministries.",
    },
    {
        icon: Search,
        title: "Analysis & Detection",
        description: "Advanced algorithms analyze contracts to identify patterns and anomalies.",
    },
    {
        icon: Bell,
        title: "Alert & Flag",
        description: "Automatically flag suspicious contracts and notify relevant stakeholders.",
    },
    {
        icon: FileBarChart,
        title: "Report & Transparency",
        description: "Generate comprehensive reports accessible to journalists, citizens, and officials.",
    },
];

const HowItWorks = () => {
    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        How It Works
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Our platform uses a systematic approach to ensure transparency and accountability.
                    </p>
                </div>

                <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <div key={index} className="relative text-center">
                            {index < steps.length - 1 && (
                                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border lg:block" />
                            )}
                            <div className="relative z-10 mb-4 flex justify-center">
                                <div className="rounded-full bg-primary p-4">
                                    <step.icon className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="mb-2 text-xl font-semibold">{step.title}</div>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
