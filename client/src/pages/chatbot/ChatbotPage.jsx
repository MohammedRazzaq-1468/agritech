import React from 'react';
import { PageHeader } from '../../components/layout/DashboardLayout.jsx';
import { ChatWindow } from '../../components/chatbot/ChatWindow.jsx';

export function ChatbotPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="AI Agricultural Assistant Consultation"
        subtitle="Conversational agronomist powered by Google Gemini 2.5 with knowledge of Indian crops, soils, pests, and irrigation"
      />

      <ChatWindow />
    </div>
  );
}

