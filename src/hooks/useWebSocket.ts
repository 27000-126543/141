import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/stores/useGameStore';
import type { SocketEvents, HackEvent, MarketAnnouncement, StormParticipant, StolenData } from '../../shared/types';

const SERVER_URL = 'http://localhost:3002';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  const attemptReconnectRef = useRef<(() => void) | null>(null);

  const updateHackProgress = useGameStore(state => state.updateHackProgress);
  const completeHack = useGameStore(state => state.completeHack);
  const addAnnouncement = useGameStore(state => state.addAnnouncement);

  const setupSocketListeners = useCallback((socket: Socket) => {
    socket.on('connect', () => {
      console.log('[WebSocket] 已连接到服务器');
      reconnectAttemptsRef.current = 0;

      const { currentHackSession: session, activeDataStorms: storms } = useGameStore.getState();
      if (session) {
        socket.emit('hack:join', session.id);
      }

      storms.forEach(storm => {
        socket.emit('storm:join', storm.id);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] 连接断开:', reason);
      if (!isManualDisconnectRef.current && attemptReconnectRef.current) {
        attemptReconnectRef.current();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] 连接错误:', error.message);
      if (!isManualDisconnectRef.current && attemptReconnectRef.current) {
        attemptReconnectRef.current();
      }
    });

    socket.on('hack:update', (data: SocketEvents['hack:update']) => {
      const currentSession = useGameStore.getState().currentHackSession;
      if (currentSession && data.sessionId === currentSession.id) {
        updateHackProgress(
          data.sessionId,
          data.progress,
          data.detectionRisk,
          data.remainingTraffic
        );
      }
    });

    socket.on('hack:event', (data: SocketEvents['hack:event']) => {
      const currentSession = useGameStore.getState().currentHackSession;
      if (currentSession && data.sessionId === currentSession.id) {
        const event: HackEvent = data.event;
        let progress = currentSession.progress;
        let detectionRisk = currentSession.detectionRisk;
        let remainingTraffic = currentSession.remainingTraffic;

        switch (event.type) {
          case 'vulnerability_found':
          case 'encryption_weakness':
            progress = Math.min(100, progress + event.effect);
            break;
          case 'system_crash':
            remainingTraffic = Math.max(0, remainingTraffic - event.effect);
            break;
          case 'counter_hack':
          case 'honeypot':
            detectionRisk = Math.min(100, detectionRisk + event.effect);
            break;
          case 'traffic_spike':
            progress = Math.max(0, progress - event.effect * 0.5);
            break;
        }

        useGameStore.setState({
          currentHackSession: {
            ...currentSession,
            progress,
            detectionRisk,
            remainingTraffic,
            events: [...currentSession.events, event],
          },
        });

        if (progress >= 100) {
          completeHack(data.sessionId, true);
        } else if (remainingTraffic <= 0 || detectionRisk >= 100) {
          completeHack(data.sessionId, false);
        }
      }
    });

    socket.on('hack:complete', (data: SocketEvents['hack:complete']) => {
      const currentSession = useGameStore.getState().currentHackSession;
      if (currentSession && data.sessionId === currentSession.id) {
        completeHack(data.sessionId, data.success);

        if (data.success && data.rewards) {
          const { player, team, playerInventory } = useGameStore.getState();
          if (player && team) {
            const newData: StolenData[] = data.rewards.data || [];
            useGameStore.setState({
              player: {
                ...player,
                credits: player.credits + (data.rewards.credits || 0),
                reputation: player.reputation + Math.floor((data.rewards.points || 0) / 10),
              },
              team: {
                ...team,
                totalPoints: team.totalPoints + (data.rewards.points || 0),
              },
              playerInventory: [...playerInventory, ...newData],
            });
          }
        }
      }
    });

    socket.on('market:announce', (data: MarketAnnouncement) => {
      addAnnouncement(data);
    });

    socket.on('storm:update', (data: SocketEvents['storm:update']) => {
      const { activeDataStorms: storms } = useGameStore.getState();
      const updatedStorms = storms.map(storm =>
        storm.id === data.stormId
          ? {
              ...storm,
              participantTeams: data.participants as StormParticipant[],
              totalDamage: data.totalDamage,
            }
          : storm
      );
      useGameStore.setState({ activeDataStorms: updatedStorms });
    });

    socket.on('storm:complete', (data: SocketEvents['storm:complete']) => {
      const { activeDataStorms: storms, player, team } = useGameStore.getState();
      const newStatus: 'completed' | 'failed' = data.success ? 'completed' : 'failed';
      const updatedStorms = storms.map(storm =>
        storm.id === data.stormId
          ? {
              ...storm,
              status: newStatus,
            }
          : storm
      );
      useGameStore.setState({ activeDataStorms: updatedStorms });

      if (data.success && team) {
        const teamShare = data.shares.find(s => s.teamId === team.id);
        if (teamShare && player) {
          useGameStore.setState({
            player: {
              ...player,
              credits: player.credits + teamShare.amount,
            },
          });
        }
      }
    });
  }, [updateHackProgress, completeHack, addAnnouncement]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    isManualDisconnectRef.current = false;

    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 10000,
    });

    socketRef.current = socket;
    setupSocketListeners(socket);
  }, [setupSocketListeners]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WebSocket] 达到最大重连次数，停止重连');
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = RECONNECT_DELAY * Math.min(reconnectAttemptsRef.current, 5);

    console.log(
      `[WebSocket] 尝试重连 (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})，${delay}ms 后...`
    );

    setTimeout(() => {
      if (!isManualDisconnectRef.current && !socketRef.current?.connected) {
        connect();
      }
    }, delay);
  }, [connect]);

  attemptReconnectRef.current = attemptReconnect;

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback(<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: socketRef.current?.connected || false,
    emit,
    connect,
    disconnect,
  };
}
