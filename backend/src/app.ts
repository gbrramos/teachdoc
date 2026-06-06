import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import documentRoutes from './routes/document.routes';

const app = express();
const port = process.env.PORT || 8000;
const routes = Router();

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/', routes);
routes.use('/', authRoutes);
routes.use('/', roomRoutes);
routes.use('/', documentRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;