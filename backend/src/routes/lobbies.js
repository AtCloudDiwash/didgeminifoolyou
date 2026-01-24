import express from 'express';
import { createLobby, getLobbies } from '../controllers/lobbyController.js';

const router = express.Router();

// Route /lobbies/*

router.post('/create', createLobby);
router.get('/', getLobbies);

export default router;