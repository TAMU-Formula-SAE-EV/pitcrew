import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const emailDomain = user.email?.split('@')[1]

                if (emailDomain !== 'tamu.edu') {
                    return false;
                }

                const existingAdmin = await prisma.admin.findUnique({
                    where: { email: user.email! },
                });

                if (!existingAdmin) {
                    await prisma.admin.create({
                        data: {
                            name: user.name!,
                            email: user.email!,
                        },
                    });
                }
            }
            return true;
        },

        async jwt({ token }) {
            const admin = await prisma.admin.findUnique({
                where: { email: token.email! },
            });

            if (admin) {
                token.id = admin.id;
                token.role = admin.role;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user = {
                    id: token.id as string,
                    name: token.name as string,
                    email: token.email as string,
                    role: token.role as string,
                } as SessionUser;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
