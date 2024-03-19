import prisma from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { getServerSession, type DefaultUser, type NextAuthOptions } from 'next-auth'
import GoogleProvider from "next-auth/providers/google";

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            async profile(profile) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: profile.email
                    }
                });
                if(user) return user as DefaultUser;
                else {
                    return await prisma.user.create({
                        data: {
                            name: profile.name,
                            email: profile.email,
                            image: profile.picture,
                            role: "user",
                        }
                    })
                }
            },
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update") {
                return { ...token, ...session.user };
            }
            return { ...token, ...user };
        },

        async session({ session, token }) {
            session.user = token as any;
            return session
        },
    },
    // pages: {
    //     signIn: '/login',
    // },
    secret: process.env.NEXTAUTH_SECRET
}

export const getAuthSession = () => getServerSession(options);