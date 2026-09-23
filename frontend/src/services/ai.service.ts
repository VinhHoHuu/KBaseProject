const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  referencedDocs?: string;
  createdAt?: string;
}

/**
 * Service giao tiếp với AI Chatbot API.
 * Hỗ trợ SSE streaming cho real-time response.
 */
export const AiService = {

  /**
   * Gửi câu hỏi cho AI chatbot qua SSE streaming.
   * @param projectId ID dự án
   * @param question Câu hỏi
   * @param onChunk Callback mỗi khi nhận được 1 chunk text
   * @param onDone Callback khi hoàn thành, trả về list tên documents tham chiếu
   * @param onError Callback khi có lỗi
   */
  sendMessage(
    projectId: number,
    question: string,
    onChunk: (text: string) => void,
    onDone: (referencedDocs: string[]) => void,
    onError: (error: string) => void
  ): AbortController {
    const controller = new AbortController();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log("[ai.service] Sending token:", token);

    fetch(`${API_URL}/projects/${projectId}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          onError(text || 'Lỗi kết nối đến server');
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError('Không thể đọc response');
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events từ buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Giữ lại phần chưa hoàn chỉnh

          for (const line of lines) {
            if (line.startsWith('event:')) {
              // Sẽ được xử lý cùng với data line tiếp theo
              continue;
            }
            if (line.startsWith('data:')) {
              const data = line.substring(5);
              
              // Tìm event type từ line trước đó
              const prevEventLine = lines[lines.indexOf(line) - 1];
              const eventType = prevEventLine?.startsWith('event:') 
                ? prevEventLine.substring(6).trim() 
                : 'message';

              if (eventType === 'message') {
                onChunk(data);
              } else if (eventType === 'done') {
                try {
                  const docs = JSON.parse(data);
                  onDone(docs);
                } catch {
                  onDone([]);
                }
              } else if (eventType === 'error') {
                onError(data);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError('Lỗi kết nối: ' + err.message);
        }
      });

    return controller;
  },

  /**
   * Lấy lịch sử chat.
   */
  async getChatHistory(projectId: number): Promise<ChatMessage[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/projects/${projectId}/ai/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    return response.json();
  },

  /**
   * Xóa lịch sử chat.
   */
  async clearHistory(projectId: number): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await fetch(`${API_URL}/projects/${projectId}/ai/history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to clear chat history');
    }
  },
};
