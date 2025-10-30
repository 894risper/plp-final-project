import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
    return (
        <section className="bg-primary py-20 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 flex justify-center">
                        <Shield className="h-16 w-16" strokeWidth={1.5} />
                    </div>

                    <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
                        Join the Fight Against Corruption
                    </h2>

                    <p className="mb-8 text-lg opacity-90 md:text-xl">
                        Access transparent government procurement data and help promote accountability.
                        Whether you are  a journalist, citizen, or official, start exploring today.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Button size="lg" variant="secondary" className="text-lg">
                            Create Account
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-primary-foreground text-lg text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
