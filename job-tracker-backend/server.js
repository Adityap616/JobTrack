import expess from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
//import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();
connectDB();

const app = expess();
app.use(cors());
app.use(expess.json());

//app.use('/api', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/jobs/export', exportRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

