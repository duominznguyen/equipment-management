import { Router } from 'express'
import { getOverview, getMaintenanceReport, getPartsCostReport } from './reports.controller.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { roleMiddleware } from '../../middlewares/role.middleware.js'

const router = Router()

router.get('/overview', authMiddleware, roleMiddleware('admin'), getOverview)
router.get('/maintenance', authMiddleware, roleMiddleware('admin'), getMaintenanceReport)
router.get('/parts-cost', authMiddleware, roleMiddleware('admin'), getPartsCostReport)

export default router