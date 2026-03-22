import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware.js'
import * as Service from './part-exports.service.js'

export const getAll = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getAll(req.query)) }
  catch (error: any) { res.status(500).json({ message: error.message }) }
}

export const getById = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getById(Number(req.params.id))) }
  catch (error: any) { res.status(404).json({ message: error.message }) }
}

export const create = async (req: AuthRequest, res: Response) => {
  try { res.status(201).json(await Service.create(req.user!.id, req.body)) }
  catch (error: any) { res.status(400).json({ message: error.message }) }
}