import express from 'express';
import { testAPI } from '../controllers/testControllers.js';

const router = express.Router();

router.get('/test', testAPI);

export default router;
