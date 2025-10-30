import { Shield } from "lucide-react";

const Footer = () => {
    return (
        <footer className="border-t border-border bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-4">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <span className="text-lg font-semibold">Corruption Tracker</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Promoting transparency in government procurement through data-driven insights.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Dashboard</a></li>
                            <li><a href="#" className="hover:text-foreground">Contracts</a></li>
                            <li><a href="#" className="hover:text-foreground">Analytics</a></li>
                            <li><a href="#" className="hover:text-foreground">Reports</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                            <li><a href="#" className="hover:text-foreground">API</a></li>
                            <li><a href="#" className="hover:text-foreground">Support</a></li>
                            <li><a href="#" className="hover:text-foreground">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>© 2024 Corruption Tracker. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
