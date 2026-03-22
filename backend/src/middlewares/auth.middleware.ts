import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.js'

export interface AuthRequest extends Request {
  user?: { id: number; role: string }
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}