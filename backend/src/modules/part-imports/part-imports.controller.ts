import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware.js'
import * as Service from './part-imports.service.js'

export const getAll = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getAll({ id: req.user!.id, role: req.user!.role }, req.query)) }
  catch (error: any) { res.status(500).json({ message: error.message }) }
}

export const getById = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getById(Number(req.params.id))) }
  catch (error: any) { res.status(404).json({ message: error.message }) }
}

export const create = async (req: AuthRequest, res: Response) => {
  try { res.status(201).json(await Service.create({ id: req.user!.id, role: req.user!.role }, req.body)) }
  catch (error: any) { res.status(400).json({ message: error.message }) }
}

export const update = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.update(Number(req.params.id), req.body)) }
  catch (error: any) { res.status(400).json({ message: error.message }) }
}

export const remove = async (req: AuthRequest, res: Response) => {
  try { await Service.remove(Number(req.params.id)); res.json({ message: 'Xoá thành công' }) }
  catch (error: any) { res.status(400).json({ message: error.message }) }
}

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.updateStatus(Number(req.params.id), req.body.status, req.body.rejectReason)) }
  catch (error: any) { res.status(400).json({ message: error.message }) }
}