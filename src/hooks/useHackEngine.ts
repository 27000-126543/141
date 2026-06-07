import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { HackSession, HackEvent, SkillType } from '../../shared/types';
import { useGameStore } from '../stores/useGameStore';

const SKILL_COOLDOWN = 15000;

const eventTemplates = [
  { type: 'vulnerability_found' as const, desc: '发现{CVE}漏洞，进度提升{value}%', isPositive: true, minValue: 5, maxValue: 20 },
  { type: 'encryption_weakness' as const, desc: '检测到加密算法弱点，破解速度提升{value}%', isPositive: true, minValue: 3, maxValue: 12 },
  { type: 'system_crash' as const, desc: '目标系统响应异常，流量消耗增加{value}%', isPositive: false, minValue: 5, maxValue: 15 },
  { type: 'counter_hack' as const, desc: '反追踪系统启动扫描，风险提升{value}%', isPositive: false, minValue: 8, maxValue: 20 },
  { type: 'traffic_spike' as const, desc: '网络流量异常波动，进度减缓{value}%', isPositive: false, minValue: 3, maxValue: 10 },
  { type: 'honeypot' as const, desc: '警告：检测到蜜罐陷阱！风险飙升{value}%', isPositive: false, minValue: 15, maxValue: 30 },
];

const cveNames = ['CVE-2026-7777', 'CVE-2026-1337', 'CVE-2026-0001', 'CVE-2026-9999', 'CVE-2026-4242'];

export function useHackEngine() {
  const session = useGameStore(state => state.currentHackSession);
  const updateHackProgress = useGameStore(state => state.updateHackProgress);
  const completeHack = useGameStore(state => state.completeHack);
  const skillAction = useGameStore(state => state.useSkill);

  const [skillCooldowns, setSkillCooldowns] = useState<Record<SkillType, number>>({
    cracking: 0,
    programming: 0,
    stealth: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const eventIntervalRef = useRef<number | null>(null);
  const sessionRef = useRef<HackSession | null>(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const generateEvent = useCallback((): HackEvent => {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    const value = Math.floor(Math.random() * (template.maxValue - template.minValue + 1)) + template.minValue;
    const cve = cveNames[Math.floor(Math.random() * cveNames.length)];
    const description = template.desc.replace('{value}', value.toString()).replace('{CVE}', cve);

    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      description,
      effect: value,
      isPositive: template.isPositive,
      createdAt: new Date().toISOString(),
    };
  }, []);

  const applyEvent = useCallback((event: HackEvent, currentSession: HackSession): Partial<HackSession> => {
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

    return { progress, detectionRisk, remainingTraffic };
  }, []);

  const tick = useCallback(() => {
    if (!session || session.status !== 'hacking') return;

    const crackingBoost = session.activeSkills
      .filter(s => s.type === 'cracking' && new Date(s.expiresAt) > new Date())
      .reduce((sum, s) => sum + s.boostAmount, 0);

    const stealthBoost = session.activeSkills
      .filter(s => s.type === 'stealth' && new Date(s.expiresAt) > new Date())
      .reduce((sum, s) => sum + s.boostAmount, 0);

    const baseProgress = (100 / session.target.estimatedTime) * (1 + crackingBoost * 0.01);
    const baseTraffic = 100 / session.target.estimatedTime;
    const baseRisk = (session.target.alertProbability * 100) / session.target.estimatedTime;
    const riskReduction = stealthBoost * 0.005;

    const newProgress = Math.min(100, session.progress + baseProgress);
    const newTraffic = Math.max(0, session.remainingTraffic - baseTraffic);
    const newRisk = Math.min(100, Math.max(0, session.detectionRisk + baseRisk - riskReduction));

    updateHackProgress(session.id, newProgress, newRisk, newTraffic);

    if (newProgress >= 100) {
      completeHack(session.id, true);
    } else if (newTraffic <= 0 || newRisk >= 100) {
      completeHack(session.id, false);
    }
  }, [session, updateHackProgress, completeHack]);

  const triggerRandomEvent = useCallback(() => {
    if (!session || session.status !== 'hacking') return;
    if (Math.random() > 0.3) return;

    const event = generateEvent();
    const updates = applyEvent(event, session);

    const updatedSession: HackSession = {
      ...session,
      ...updates,
      events: [...session.events, event],
    };

    useGameStore.setState({ currentHackSession: updatedSession });

    if (updates.progress !== undefined && updates.progress >= 100) {
      completeHack(session.id, true);
    } else if ((updates.remainingTraffic !== undefined && updates.remainingTraffic <= 0) ||
               (updates.detectionRisk !== undefined && updates.detectionRisk >= 100)) {
      completeHack(session.id, false);
    }
  }, [session, generateEvent, applyEvent, completeHack]);

  const useSkill = useCallback(async (skillType: SkillType) => {
    const currentSession = sessionRef.current;
    if (!currentSession || currentSession.status !== 'hacking') return false;
    if (skillCooldowns[skillType] > 0) return false;

    const success = await skillAction(skillType);
    if (success) {
      setSkillCooldowns(prev => ({
        ...prev,
        [skillType]: SKILL_COOLDOWN,
      }));
    }
    return success;
  }, [skillCooldowns, skillAction]);

  useEffect(() => {
    const cooldownInterval = setInterval(() => {
      setSkillCooldowns(prev => ({
        cracking: Math.max(0, prev.cracking - 1000),
        programming: Math.max(0, prev.programming - 1000),
        stealth: Math.max(0, prev.stealth - 1000),
      }));
    }, 1000);

    return () => clearInterval(cooldownInterval);
  }, []);

  useEffect(() => {
    const currentSession = sessionRef.current;
    if (currentSession && currentSession.status === 'hacking') {
      tickIntervalRef.current = window.setInterval(tick, 1000);
      eventIntervalRef.current = window.setInterval(triggerRandomEvent, 3000);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      if (eventIntervalRef.current) {
        clearInterval(eventIntervalRef.current);
        eventIntervalRef.current = null;
      }
    };
  }, [session?.id, session?.status, tick, triggerRandomEvent]);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      const currentSession = sessionRef.current;
      if (currentSession) {
        socket.emit('hack:join', currentSession.id);
      }
    });

    socket.on('hack:update', (data) => {
      const currentSession = sessionRef.current;
      if (currentSession && data.sessionId === currentSession.id) {
        updateHackProgress(data.sessionId, data.progress, data.detectionRisk, data.remainingTraffic);
      }
    });

    socket.on('hack:event', (data) => {
      const currentSession = sessionRef.current;
      if (currentSession && data.sessionId === currentSession.id) {
        const updates = applyEvent(data.event, currentSession);
        useGameStore.setState({
          currentHackSession: {
            ...currentSession,
            ...updates,
            events: [...currentSession.events, data.event],
          },
        });
      }
    });

    socket.on('hack:complete', (data) => {
      const currentSession = sessionRef.current;
      if (currentSession && data.sessionId === currentSession.id) {
        completeHack(data.sessionId, data.success);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.id, updateHackProgress, completeHack, applyEvent]);

  return {
    session,
    skillCooldowns,
    useSkill,
  };
}
