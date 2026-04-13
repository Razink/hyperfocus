import { Response } from 'express';
import { LessonService } from '../services/lesson.service';
import { AuthRequest } from '../middleware/auth.middleware';

const lessonService = new LessonService();

export class LessonController {
  async getBySubjectId(req: AuthRequest, res: Response) {
    try {
      const data = await lessonService.getBySubjectId(req.params.subjectId, req.userId!);
      res.status(200).json(data);
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
      const lesson = await lessonService.getById(req.params.id, req.userId!);
      res.status(200).json(lesson);
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
      const lesson = await lessonService.create(req.params.subjectId, req.userId!, req.body);
      res.status(201).json(lesson);
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
      const lesson = await lessonService.update(req.params.id, req.userId!, req.body);
      res.status(200).json(lesson);
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async updateRevised(req: AuthRequest, res: Response) {
    try {
      const lesson = await lessonService.updateRevised(req.params.id, req.userId!, req.body);
      res.status(200).json(lesson);
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  async uploadScreenshot(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'FILE_REQUIRED',
            message: 'Aucun fichier fourni'
          }
        });
      }

      const screenshotUrl = `/uploads/screenshots/${req.file.filename}`;
      const lesson = await lessonService.updateScreenshot(req.params.id, req.userId!, screenshotUrl);
      res.status(200).json(lesson);
    } catch (error: any) {
      res.status(error.status || 400).json({
        error: {
          code: error.code || 'UPLOAD_ERROR',
          message: error.message
        }
      });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await lessonService.delete(req.params.id, req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.status || 404).json({
        error: {
          code: error.code || 'LESSON_NOT_FOUND',
          message: error.message
        }
      });
    }
  }
}
