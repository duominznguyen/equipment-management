import { Response } from 'express'
import { AuthRequest } from '../../middlewares/auth.middleware.js'
import * as Service from './reports.service.js'

export const getOverview = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getOverview()) }
  catch (error: any) { res.status(500).json({ message: error.message }) }
}

export const getMaintenanceReport = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getMaintenanceReport(req.query)) }
  catch (error: any) { res.status(500).json({ message: error.message }) }
}

export const getPartsCostReport = async (req: AuthRequest, res: Response) => {
  try { res.json(await Service.getPartsCostReport(req.query)) }
  catch (error: any) { res.status(500).json({ message: error.message }) }
}