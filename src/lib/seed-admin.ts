// lib/seed-admin.ts
import { hash } from "bcrypt";
import { connectMongoDB } from "./mongodb";
import User from "../../models/users";

interface SeedResult {
    success: boolean;
    message: string;
}

export async function seedAdmin(): Promise<SeedResult> {
    try {
        await connectMongoDB();

        
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminFirstName = process.env.ADMIN_FIRSTNAME;
        const adminLastName = process.env.ADMIN_LASTNAME;
        const adminPhone = process.env.ADMIN_PHONE;

        
        if (!adminEmail || !adminPassword || !adminFirstName || !adminLastName || !adminPhone) {
            throw new Error('Missing admin credentials in environment variables');
        }

        console.log('🔍 Checking for existing admin...');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return { success: true, message: 'Admin already exists' };
        }

        console.log('🔑 Hashing password...');
        
        // Hash password
        const hashedPassword = await hash(adminPassword, 10);

        console.log('👤 Creating admin user...');
        
        // Create admin user
        await User.create({
            firstName: adminFirstName,
            lastName: adminLastName,
            phone: parseInt(adminPhone),
            email: adminEmail,
            password: hashedPassword,
            role: 'admin' as const,
            status: 'active' as const
        });

        console.log('Admin user created successfully');
        console.log('Email:', adminEmail);
        console.log(' Password:', '***' + adminPassword.slice(-3)); // Only show last 3 chars for security
        
        return { success: true, message: 'Admin created successfully' };
        
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { success: false, message: errorMessage };
    }
}