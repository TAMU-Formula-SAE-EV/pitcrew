import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';

const adminNetIds = process.env.ADMIN_NET_IDS;

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
                const [netID, emailDomain] = user.email?.split('@') || []

                if (emailDomain !== 'tamu.edu') {
                    return false;
                }

                if (adminNetIds?.includes(netID)) {
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
                } else {
                    const existingApplicant = await prisma.applicant.findUnique({
                        where: { email: user.email! },
                    });

                    if (!existingApplicant) {
                        await prisma.applicant.create({
                            data: {
                                name: user.name!,
                                email: user.email!,
                            }
                        })
                    }
                }
            }
            return true;
        },

        async jwt({ token }) {
            const admin = await prisma.admin.findUnique({
                where: { email: token.email! },
            });

            const applicant = await prisma.applicant.findUnique({
                where: { email: token.email! },
            })

            if (admin) {
                token.id = admin.id;
                token.role = admin.role;
                token.admin = true;
            } else if (applicant) {
                token.id = applicant.id;
                token.admin = false;
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
                    admin: token.admin as boolean,
                };
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
