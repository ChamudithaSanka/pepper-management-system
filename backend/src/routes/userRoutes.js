import express from 'express';
import {
    loginStaff,
    logoutStaff,
    checkStaffSession,
    getAllUsers,
    getUserById,
    getUserStats,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Staff authentication routes
router.post('/login', loginStaff);
router.post('/logout', logoutStaff);
router.get('/session', checkStaffSession);

// User management routes
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
