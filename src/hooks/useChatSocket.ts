import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/client';

type MessageEvent = { conversationId: string; message: Record<string, unknown> };

/** Connects the admin dashboard to the Super-Chat Socket.IO server so new messages
 * from Users/Partners appear live without polling. */
export function useChatSocket(onMessage: (evt: MessageEvent) => void) {
  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef<Set<string>>(new Set());
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const token = localStorage.getItem('nexgen_admin_token');
    if (!token) return undefined;

    const origin = API_BASE_URL.replace(/\/api\/v\d+$/i, '');
    const socket = io(origin, {
      path: '/socket.io',
      auth: { token, role: 'admin' },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    const joined = joinedRef.current;

    socket.on('message:new', (evt: MessageEvent) => onMessageRef.current(evt));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      joined.clear();
    };
  }, []);

  const joinRoom = (conversationId: string) => {
    if (!conversationId || joinedRef.current.has(conversationId)) return;
    socketRef.current?.emit('join_conversation', conversationId);
    joinedRef.current.add(conversationId);
  };

  return { joinRoom };
}
