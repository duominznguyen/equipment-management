import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware.js'

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    next()
  }
}