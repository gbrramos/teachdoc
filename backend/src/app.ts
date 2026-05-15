import express, { Request, Response, Router } from 'express';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';

const app = express();
const port = process.env.PORT || 8000;
const routes = Router();

app.use(express.json());

app.use('/', routes);
routes.use('/', authRoutes);
routes.use('/', roomRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;