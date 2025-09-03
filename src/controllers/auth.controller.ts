import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { SignJWT } from 'jose';

// Helper: remove password from user object
const sanitizeUser = (u: { id: number; email: string; username: string }) => ({
  id: u.id,
  email: u.email,
  username: u.username,
});

export const signup = async ({ body }: any) => {
  const { email, username, password } = body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: { id: true, email: true, username: true },
    });
    return { message: 'User created successfully', user };
  } catch (error) {
    return { message: 'Error creating user' };
  }
};

export const login = async ({ body }: any) => {
  const { email, password } = body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, password: true },
    });
    if (!user) return { message: 'Invalid credentials' };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { message: 'Invalid credentials' };

    // Issue JWT with jose
    // NOTE: Replace with a secure secret via env (e.g., JWT_SECRET)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
    const token = await new SignJWT({ sub: String(user.id), email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    const safeUser = sanitizeUser(user);
    return { message: 'Login successful', user: safeUser, token };
  } catch {
    return { message: 'Error logging in' };
  }
};