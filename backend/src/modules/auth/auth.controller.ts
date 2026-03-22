import { Request, Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware.js'
import * as AuthService from './auth.service.js'

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ message: 'Vui lòng nhập username và password' })
      return
    }
    const result = await AuthService.login(username, password)
    res.json(result)
  } catch (error: any) {
    res.status(401).json({ message: error.message })
  }
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await AuthService.getMe(req.user!.id)
    res.json(user)
  } catch (error: any) {
    res.status(404).json({ message: error.message })
  }
}