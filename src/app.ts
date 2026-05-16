import express, { Application } from 'express';
import router from './routes';
import { notFound } from './middlewares/notFound';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount modules
app.use('/api/v1', router);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// app.use(globalErrorHandler);
app.use(notFound);

export default app;