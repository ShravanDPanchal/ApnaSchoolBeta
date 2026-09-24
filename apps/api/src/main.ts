import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './modules/auth/auth.controller';
import { schoolRouter } from './modules/school/school.controller';
import { studentRouter } from './modules/student/student.controller';
import { staffRouter } from './modules/staff/staff.controller';
import { attendanceRouter } from './modules/attendance/attendance.controller';
import { timetableRouter } from './modules/timetable/timetable.controller';
import { feesRouter } from './modules/fees/fees.controller';
import { accountingRouter } from './modules/accounting/accounting.controller';
import { rojmelRouter } from './modules/rojmel/rojmel.controller';
import { reportsRouter } from './modules/reports/reports.controller';
import { dashboardRouter } from './modules/dashboard/dashboard.controller';
import { examRouter } from './modules/exam/exam.controller';
import { grantsRouter } from './modules/grants/grants.controller';

export const app = express();

app.use(cors());
app.use(express.json());

// Health Check & Root Info
app.get(['/', '/api/v1'], (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Apna School ERP - Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
          .badge { display: inline-block; background: #0284c7; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          p { color: #94a3b8; font-size: 14px; margin: 0 0 24px; line-height: 1.5; }
          .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; transition: background 0.2s; }
          .btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">🚀 REST API LIVE</div>
          <h1>Apna School API Server</h1>
          <p>The backend API is running on <strong>port 3001</strong>.<br/>To access the interactive web ERP application and dashboard, click below:</p>
          <a href="http://localhost:3000" class="btn">👉 Open Web ERP (http://localhost:3000)</a>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'Apna School ERP (Gujarat)' });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/school', schoolRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/timetable', timetableRouter);
app.use('/api/v1/exam', examRouter);
app.use('/api/v1/fees', feesRouter);
app.use('/api/v1/accounting', accountingRouter);
app.use('/api/v1/rojmel', rojmelRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/grants', grantsRouter);

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 Apna School API Server is running on port ${config.port}`);
  });
}
