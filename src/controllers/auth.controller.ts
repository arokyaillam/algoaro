import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { SignJWT } from 'jose';

// Helper: remove password from user object
const sanitizeUser = (user: { password?: string } & any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const signup = async ({ body }: any) => {
  const { email, username, password } = body;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    const error: any = new Error("User with this email or username already exists");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
    select: { id: true, email: true, username: true },
  });

  return user;
};

export const login = async ({ body }: any) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error: any = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  // Issue JWT with jose
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined. Please set it in your .env file');
    const error: any = new Error("Internal server error");
    error.status = 500;
    throw error;
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ sub: String(user.id), email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

  const safeUser = sanitizeUser(user);
  return { user: safeUser, token };
};