import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import farmRoutes from './routes/farm.routes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running with Prisma ORM' });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
