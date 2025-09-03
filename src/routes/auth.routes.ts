import { Elysia, t } from 'elysia';
import { signup, login } from '../controllers/auth.controller';

const app = new Elysia({ prefix: '/auth' });

app.post(
  '/signup',
  async ({ body }) => {
    return signup({ body });
  },
  {
    body: t.Object({
      email: t.String(),
      username: t.String(),
      password: t.String(),
    }),
  }
);

app.post(
  '/login',
  async ({ body }) => {
    return login({ body });
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  }
);

export default app;