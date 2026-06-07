import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import type { Player, PlayerSkills, AuthResponse, APIError } from '../../shared/types'

const players = new Map<string, Player>()
const usernameIndex = new Map<string, string>()
const tokenBlacklist = new Set<string>()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'
const BCRYPT_SALT_ROUNDS = 12

const avatars = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=5',
]

const passwordStore = new Map<string, string>()

export const AuthService = {
  async register(username: string, password: string): Promise<AuthResponse> {
    if (!username || username.length < 3) {
      throw new Error('用户名至少需要3个字符')
    }
    if (!password || password.length < 6) {
      throw new Error('密码至少需要6个字符')
    }

    if (usernameIndex.has(username.toLowerCase())) {
      throw new Error('用户名已存在')
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const skills: PlayerSkills = {
      cracking: Math.floor(10 + Math.random() * 20),
      programming: Math.floor(10 + Math.random() * 20),
      stealth: Math.floor(10 + Math.random() * 20),
    }

    const player: Player = {
      id: playerId,
      username,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      skills,
      reputation: 0,
      credits: 1000,
      teamId: null,
      teamRole: null,
      createdAt: new Date().toISOString(),
    }

    players.set(playerId, player)
    usernameIndex.set(username.toLowerCase(), playerId)
    passwordStore.set(playerId, hashedPassword)

    const token = this.generateToken(player)

    return { token, player }
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const playerId = usernameIndex.get(username.toLowerCase())
    if (!playerId) {
      throw new Error('用户名或密码错误')
    }

    const player = players.get(playerId)
    if (!player) {
      throw new Error('用户名或密码错误')
    }

    const hashedPassword = passwordStore.get(playerId)
    if (!hashedPassword) {
      throw new Error('用户名或密码错误')
    }

    const isPasswordValid = await bcrypt.compare(password, hashedPassword)
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误')
    }

    const token = this.generateToken(player)

    return { token, player }
  },

  generateToken(player: Player): string {
    const payload = {
      id: player.id,
      username: player.username,
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  },

  verifyToken(token: string): { id: string; username: string } | null {
    try {
      if (tokenBlacklist.has(token)) {
        return null
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string }
      return decoded
    } catch {
      return null
    }
  },

  logout(token: string): void {
    tokenBlacklist.add(token)
  },

  getPlayer(playerId: string): Player | undefined {
    return players.get(playerId)
  },

  getPlayerByUsername(username: string): Player | undefined {
    const playerId = usernameIndex.get(username.toLowerCase())
    if (!playerId) {
      return undefined
    }
    return players.get(playerId)
  },

  updatePlayer(playerId: string, updates: Partial<Player>): Player | undefined {
    const player = players.get(playerId)
    if (!player) {
      return undefined
    }

    const updatedPlayer = { ...player, ...updates }
    players.set(playerId, updatedPlayer)
    return updatedPlayer
  },

  authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: APIError = {
        error: 'Unauthorized',
        message: '未提供认证令牌',
        code: 401,
      }
      res.status(401).json(error)
      return
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.verifyToken(token)

    if (!decoded) {
      const error: APIError = {
        error: 'Unauthorized',
        message: '认证令牌无效或已过期',
        code: 401,
      }
      res.status(401).json(error)
      return
    }

    const player = AuthService.getPlayer(decoded.id)
    if (!player) {
      const error: APIError = {
        error: 'Unauthorized',
        message: '用户不存在',
        code: 401,
      }
      res.status(401).json(error)
      return
    }

    ;(req as Request & { player: Player; token: string }).player = player
    ;(req as Request & { player: Player; token: string }).token = token

    next()
  },

  requireRole(allowedRoles: Array<'leader' | 'officer' | 'operator'>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const player = (req as Request & { player: Player }).player

      if (!player.teamRole || !allowedRoles.includes(player.teamRole)) {
        const error: APIError = {
          error: 'Forbidden',
          message: '权限不足',
          code: 403,
        }
        res.status(403).json(error)
        return
      }

      next()
    }
  },

  getAllPlayers(): Player[] {
    return Array.from(players.values())
  },

  deletePlayer(playerId: string): boolean {
    const player = players.get(playerId)
    if (!player) {
      return false
    }

    usernameIndex.delete(player.username.toLowerCase())
    passwordStore.delete(playerId)
    return players.delete(playerId)
  },
}
