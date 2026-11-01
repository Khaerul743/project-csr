"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ConversationListItem, MessageWithSender } from "./types";

interface ConversationCenterViewProps {
  userRole: "CSR_ADMIN" | "PARTNER_ADMIN";
  initialCollaborationId?: string | null;
  onViewCollaborationDetails?: (collaborationId: string) => void;
}

export function ConversationCenterView({
  userRole,
  initialCollaborationId,
  onViewCollaborationDetails,
}: ConversationCenterViewProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationListItem | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          setCurrentUserId(decoded.sub || "");
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch conversations list
  const fetchConversations = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoadingConversations(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch("/api/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Gagal memuat percakapan");
        }

        const data: ConversationListItem[] = json.data || [];
        setConversations(data);

        // If initialCollaborationId is provided, select it automatically
        if (initialCollaborationId && !selectedConversation) {
          const matched = data.find(
            (c: ConversationListItem) =>
              c.collaborationId === initialCollaborationId
          );
          if (matched) {
            setSelectedConversation(matched);
          }
        }
      } catch (err: any) {
        if (!isBackground) setErrorMsg(err.message);
      } finally {
        if (!isBackground) setIsLoadingConversations(false);
      }
    },
    [initialCollaborationId, selectedConversation]
  );

  // Fetch messages for active conversation
  const fetchMessages = useCallback(
    async (collaborationId: string, isBackground = false) => {
      if (!isBackground) setIsLoadingMessages(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const res = await fetch(
          `/api/conversations/${collaborationId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || "Gagal memuat pesan");
        }

        setMessages(json.data || []);
      } catch (err: any) {
        if (!isBackground) setErrorMsg(err.message);
      } finally {
        if (!isBackground) setIsLoadingMessages(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages whenever selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.collaborationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  // Polling every 5 seconds for real-time messages & unread counter
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedConversation) {
        fetchMessages(selectedConversation.collaborationId, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedConversation, fetchConversations, fetchMessages]);

  const handleSelectConversation = (item: ConversationListItem) => {
    setSelectedConversation(item);
    // Optimistically mark unread as 0 in list
    setConversations((prev) =>
      prev.map((c) =>
        c.collaborationId === item.collaborationId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleSendMessage = async (
    content: string,
    attachmentUrl?: string | null,
    attachmentName?: string | null
  ) => {
    if (!selectedConversation) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Sesi login berakhir. Silakan login kembali.");

      const res = await fetch(
        `/api/conversations/${selectedConversation.collaborationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            attachmentUrl,
            attachmentName,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Gagal mengirim pesan");
      }

      // Append new message immediately
      if (json.data) {
        setMessages((prev) => [...prev, json.data]);
      }

      // Refresh list to update latest message preview
      fetchConversations(true);
    } catch (err: any) {
      // Throw error to ChatWindow to display inline banner without wiping user input
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[550px] bg-white rounded-3xl border border-[#E8E8EA] shadow-2xs flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Back Button (hanya tampil di layar kecil saat percakapan aktif) */}
      {selectedConversation && (
        <div className="md:hidden p-3 bg-[#181343] text-white flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSelectedConversation(null)}
            className="p-1 hover:bg-white/10 rounded-lg flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Kembali ke Daftar Percakapan</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. PANEL KIRI: DAFTAR PERCAKAPAN (~32% Desktop)              */}
      {/* ============================================================ */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-[32%] lg:w-[32%] shrink-0 h-full border-r border-[#E8E8EA]`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.collaborationId || null}
          onSelect={handleSelectConversation}
          userRole={userRole}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. PANEL KANAN: RUANG PERCAKAPAN (~68% Desktop)              */}
      {/* ============================================================ */}
      <div
        className={`${
          selectedConversation ? "flex" : "hidden md:flex"
        } w-full md:w-[68%] lg:w-[68%] flex-1 h-full min-w-0`}
      >
        <ChatWindow
          activeConversation={selectedConversation}
          messages={messages}
          currentUserId={currentUserId}
          userRole={userRole}
          onSendMessage={handleSendMessage}
          onViewCollaborationDetails={onViewCollaborationDetails}
          isLoadingMessages={isLoadingMessages}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
