import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import documentRoutes from './routes/document.routes';

const app = express();
const port = process.env.PORT || 8000;
const routes = Router();

app.use(cors());
app.use(express.json());

app.use('/', routes);
routes.use('/', authRoutes);
routes.use('/', roomRoutes);
routes.use('/', documentRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;