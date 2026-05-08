import { Response } from 'express';
import { ExamService } from '../services/exam.service';
import { AuthRequest } from '../middleware/auth.middleware';

const examService = new ExamService();

export class ExamController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const exams = await examService.getAll(req.userId!);
      res.json({ exams });
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { subject, date, detail } = req.body;
      if (!subject || !date) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'subject et date sont requis' }
        });
      }
      const exam = await examService.create(req.userId!, { subject, date, detail });
      res.status(201).json(exam);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { subject, date, detail } = req.body;
      const exam = await examService.update(req.userId!, req.params.id, { subject, date, detail });
      res.json(exam);
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      await examService.delete(req.userId!, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(err.status || 500).json({
        error: { code: err.code || 'INTERNAL_ERROR', message: err.message }
      });
    }
  }
}
