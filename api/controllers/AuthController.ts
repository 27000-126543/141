import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Player, AuthResponse, APIError } from '../../shared/types.js';

const players = new Map<string, { player: Player; password: string }>();

const mockPlayers: Array<{ player: Player; password: string }> = [
  {
    player: {
      id: 'player-001',
      username: 'NightHawk',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NightHawk',
      skills: { cracking: 75, programming: 68, stealth: 82 },
      reputation: 2450,
      credits: 125000,
      teamId: 'team-001',
      teamRole: 'leader',
      createdAt: '2026-01-15T10:30:00Z',
    },
    password: 'password123',
  },
  {
    player: {
      id: 'player-002',
      username: 'CyberWolf',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberWolf',
      skills: { cracking: 62, programming: 85, stealth: 70 },
      reputation: 1890,
      credits: 89000,
      teamId: 'team-001',
      teamRole: 'officer',
      createdAt: '2026-02-01T14:20:00Z',
    },
    password: 'password123',
  },
  {
    player: {
      id: 'player-003',
      username: 'GhostProtocol',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GhostProtocol',
      skills: { cracking: 55, programming: 60, stealth: 90 },
      reputation: 1560,
      credits: 67000,
      teamId: 'team-001',
      teamRole: 'operator',
      createdAt: '2026-02-15T09:15:00Z',
    },
    password: 'password123',
  },
  {
    player: {
      id: 'player-004',
      username: 'ZeroDay',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ZeroDay',
      skills: { cracking: 45, programming: 50, stealth: 55 },
      reputation: 890,
      credits: 35000,
      teamId: null,
      teamRole: null,
      createdAt: '2026-03-01T16:45:00Z',
    },
    password: 'password123',
  },
];

mockPlayers.forEach((item) => {
  players.set(item.player.username.toLowerCase(), item);
  players.set(item.player.id, item);
});

const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk-hackers-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Username and password are required',
        code: 400,
      } as APIError);
      return;
    }

    const userData = players.get(username.toLowerCase());
    if (!userData) {
      res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid username or password',
        code: 401,
      } as APIError);
      return;
    }

    const isPasswordValid = password === userData.password;
    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid username or password',
        code: 401,
      } as APIError);
      return;
    }

    const token = jwt.sign(
      { playerId: userData.player.id, username: userData.player.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      player: userData.player,
    } as AuthResponse);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Username and password are required',
        code: 400,
      } as APIError);
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Passwords do not match',
        code: 400,
      } as APIError);
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long',
        code: 400,
      } as APIError);
      return;
    }

    if (players.has(username.toLowerCase())) {
      res.status(409).json({
        error: 'Registration Failed',
        message: 'Username already exists',
        code: 409,
      } as APIError);
      return;
    }

    const playerId = `player-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPlayer: Player = {
      id: playerId,
      username,
      avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username)}`,
      skills: {
        cracking: Math.floor(Math.random() * 30) + 20,
        programming: Math.floor(Math.random() * 30) + 20,
        stealth: Math.floor(Math.random() * 30) + 20,
      },
      reputation: 100,
      credits: 10000,
      teamId: null,
      teamRole: null,
      createdAt: new Date().toISOString(),
    };

    players.set(username.toLowerCase(), { player: newPlayer, password: hashedPassword });
    players.set(playerId, { player: newPlayer, password: hashedPassword });

    const token = jwt.sign(
      { playerId: newPlayer.id, username: newPlayer.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      player: newPlayer,
    } as AuthResponse);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getPlayerById = (playerId: string): Player | undefined => {
  const data = players.get(playerId);
  return data?.player;
};

export const updatePlayer = (playerId: string, updates: Partial<Player>): Player | undefined => {
  const data = players.get(playerId);
  if (!data) return undefined;

  const updatedPlayer = { ...data.player, ...updates };
  players.set(playerId, { ...data, player: updatedPlayer });
  players.set(updatedPlayer.username.toLowerCase(), { ...data, player: updatedPlayer });
  return updatedPlayer;
};
