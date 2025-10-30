import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-primary/10 p-4">
                            <Shield className="h-16 w-16 text-primary" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                        Corruption Tracker
                    </h1>

                    <p className="mb-4 text-xl text-muted-foreground md:text-2xl">
                        Government Procurement Transparency Platform
                    </p>

                    <p className="mb-10 text-lg text-muted-foreground md:text-xl">
                        Monitor and analyze government procurement contracts to promote transparency,
                        detect anomalies, and fight corruption through data-driven insights.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" className="text-lg">
                            Get Started
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg">
                            View Demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
