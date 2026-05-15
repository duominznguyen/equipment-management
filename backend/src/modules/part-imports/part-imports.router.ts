import { Router } from 'express'
import { getAll, getById, create, update, remove, updateStatus } from './part-imports.controller.js'
import { authMiddleware } from '../../middlewares/auth.middleware.js'
import { roleMiddleware } from '../../middlewares/role.middleware.js'

const router = Router()

router.get('/', authMiddleware, roleMiddleware('admin', 'technician'), getAll)
router.get('/:id', authMiddleware, roleMiddleware('admin', 'technician'), getById)
router.post('/', authMiddleware, roleMiddleware('admin', 'technician'), create)
router.put('/:id', authMiddleware, roleMiddleware('admin'), update)
router.put('/:id/status', authMiddleware, roleMiddleware('admin'), updateStatus)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), remove)

export default router