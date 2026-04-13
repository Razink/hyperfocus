import { Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { AuthRequest } from '../middleware/auth.middleware';

const subjectService = new SubjectService();

export class SubjectController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const subjects = await subjectService.getAll(req.userId!);
      res.status(200).json({ subjects });
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const subject = await subjectService.getById(req.params.id, req.userId!);
      res.status(200).json(subject);
    } catch (error: any) {
      res.status(error.status || 500).json({
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message
        }
      });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const subject = await subjectService.create(req.userId!, req.body);
      res.status(201).json(subject);
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const subject = await subjectService.update(req.params.id, req.userId!, req.body);
      res.status(200).json(subject);
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await subjectService.delete(req.params.id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 404).json({
        error: {
          code: error.code || 'SUBJECT_NOT_FOUND',
          message: error.message
        }
      });
    }
  }
}
