import { FileText, DollarSign, AlertCircle, Building2 } from "lucide-react";

const stats = [
    {
        icon: FileText,
        value: "15,847",
        label: "Contracts Monitored",
    },
    {
        icon: DollarSign,
        value: "$2.3B",
        label: "Total Value Tracked",
    },
    {
        icon: AlertCircle,
        value: "234",
        label: "Anomalies Detected",
    },
    {
        icon: Building2,
        value: "1,256",
        label: "Active Vendors",
    },
];

const Stats = () => {
    return (
        <section className="bg-secondary py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                        Making an Impact
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Real-time data and insights driving transparency in government procurement.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-primary/10 p-4">
                                    <stat.icon className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <div className="mb-2 text-4xl font-bold text-foreground">{stat.value}</div>
                            <div className="text-muted-foreground">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
