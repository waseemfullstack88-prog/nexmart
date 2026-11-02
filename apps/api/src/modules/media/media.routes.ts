import { Router } from 'express';
import * as mediaController from './media.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { resolveTenant, requireTenant } from '../../middleware/tenant';
import { requireStoreId } from '../../middleware/authorize';
import { uploadMultiple } from '../../middleware/upload';
import { updateMediaSchema, bulkDeleteMediaSchema } from './media.validation';

const router = Router();

// Store media operations require authentication and store context
router.use(authenticate);
router.use(resolveTenant);
router.use(requireStoreId);

// Upload images
router.post('/upload', uploadMultiple, mediaController.uploadMedia);

// List media (searchable, paginated)
router.get('/', mediaController.getMedia);

// Get single media details with usage
router.get('/:id', mediaController.getMediaById);

// Update media metadata (alt text, filename)
router.patch('/:id', validate({ body: updateMediaSchema }), mediaController.updateMedia);

// Delete single media
router.delete('/:id', mediaController.deleteMedia);

// Bulk delete media
router.post('/bulk-delete', validate({ body: bulkDeleteMediaSchema }), mediaController.bulkDeleteMedia);

export default router;
