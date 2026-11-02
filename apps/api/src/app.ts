import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import Routes
import authRoutes from './modules/auth/auth.routes';
import storeRoutes from './modules/stores/stores.routes';
import mediaRoutes from './modules/media/media.routes';
import categoryRoutes from './modules/categories/categories.routes';
import productRoutes from './modules/products/products.routes';
import settingsRoutes from './modules/settings/settings.routes';
import appearanceRoutes from './modules/appearance/appearance.routes';
import templateRoutes from './modules/templates/templates.routes';
import ordersRoutes from './modules/orders/orders.routes';
import customersRoutes from './modules/customers/customers.routes';

const app: Express = express();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow images to be served across domains
}));
app.use(cors({
  origin: [
    env.adminUrl,
    env.storefrontUrl,
    env.platformAdminUrl,
    /\.localhost:\d+$/,
  ],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for uploads (in development only)
if (env.isDev) {
  app.use('/uploads', express.static(path.resolve(env.uploadDir)));
}

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/stores', storeRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/appearance', appearanceRoutes);
apiRouter.use('/templates', templateRoutes);
apiRouter.use('/orders', ordersRoutes);
apiRouter.use('/customers', customersRoutes);

// Register API routes
app.use('/api', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
