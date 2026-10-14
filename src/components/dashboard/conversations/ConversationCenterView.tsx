"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
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

  // Extract user ID from token
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
  const fetchConversations = useCallback(async (isBackground = false) => {
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

      setConversations(json.data || []);

      // If initialCollaborationId is provided, select it
      if (initialCollaborationId && !selectedConversation) {
        const matched = (json.data || []).find(
          (c: ConversationListItem) => c.collaborationId === initialCollaborationId
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
  }, [initialCollaborationId, selectedConversation]);

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
      if (!token) throw new Error("Sesi login berakhir");

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
      alert(err.message || "Terjadi kesalahan saat mengirim pesan");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[500px] bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Back Button (shown when chat is active on mobile) */}
      {selectedConversation && (
        <div className="md:hidden p-3 bg-slate-900 text-white flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedConversation(null)}
            className="p-1 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Percakapan
          </button>
        </div>
      )}

      {/* Left Column: Conversation List */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-80 lg:w-96 shrink-0 h-full`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.collaborationId || null}
          onSelect={handleSelectConversation}
          userRole={userRole}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Right Column: Chat Window */}
      <div
        className={`${
          selectedConversation ? "flex" : "hidden md:flex"
        } flex-1 h-full min-w-0`}
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
