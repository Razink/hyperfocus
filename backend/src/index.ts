import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import lessonRoutes from './routes/lesson.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hyperfocus API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/lessons', lessonRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Une erreur est survenue',
      ...(err.field && { field: err.field })
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
