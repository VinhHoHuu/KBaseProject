package vinhhhse203194.fpt.academy.first_homework.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import vinhhhse203194.fpt.academy.first_homework.dto.ChatResponse;
import vinhhhse203194.fpt.academy.first_homework.entity.*;
import vinhhhse203194.fpt.academy.first_homework.repository.IChatMessageRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IDocumentRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectMemberRepository;
import vinhhhse203194.fpt.academy.first_homework.repository.IProjectRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Service chính xử lý logic AI Chatbot.
 * Flow: Nhận câu hỏi -> Lấy documents -> Extract text -> Build prompt -> Gọi Gemini -> Stream response
 */
@Service
public class AiService {

    @Autowired
    private WebClient geminiWebClient;

    @Autowired
    private IProjectRepository projectRepository;

    @Autowired
    private IProjectMemberRepository projectMemberRepository;

    @Autowired
    private IDocumentRepository documentRepository;

    @Autowired
    private IChatMessageRepository chatMessageRepository;

    @Autowired
    private DocumentTextExtractor documentTextExtractor;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String modelName;

    @Value("${gemini.max-output-tokens}")
    private int maxOutputTokens;

    @Value("${gemini.temperature}")
    private double temperature;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executor = Executors.newCachedThreadPool();

    // Các loại file hỗ trợ trích xuất text
    private static final List<String> TEXT_EXTRACTABLE_TYPES = List.of(
            "pdf", "docx", "doc", "xlsx", "xls", "pptx", "ppt", "txt", "md", "csv"
    );

    /**
     * Xử lý câu hỏi của user với SSE streaming.
     * @return SseEmitter để stream response từng phần về client
     */
    public SseEmitter chat(Long projectId, User currentUser, String question) {
        SseEmitter emitter = new SseEmitter(120_000L); // timeout 2 phút

        // 1. Kiểm tra project & quyền (chạy ở thread chính để giữ Hibernate Session)
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMemberRepository.findByUserIdAndProjectId(currentUser.getId(), projectId).isPresent();

        if (!isOwner && !isMember) {
            try {
                emitter.send(SseEmitter.event().name("error").data("Bạn không phải thành viên của dự án này!"));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
            return emitter;
        }

        executor.execute(() -> {
            try {

                // 2. Lấy documents và extract text
                List<Document> documents = documentRepository.findByProjectId(projectId);
                StringBuilder contextBuilder = new StringBuilder();
                List<String> docNames = new ArrayList<>();

                for (Document doc : documents) {
                    String ext = doc.getFileKey().substring(doc.getFileKey().lastIndexOf(".") + 1).toLowerCase();
                    if (TEXT_EXTRACTABLE_TYPES.contains(ext)) {
                        String text = documentTextExtractor.extractText(doc.getFileKey(), doc.getType());
                        if (text != null && !text.isBlank()) {
                            contextBuilder.append("\n\n--- Document: ").append(doc.getName()).append(" ---\n");
                            // Giới hạn mỗi document tối đa 50000 ký tự để tránh quá tải
                            if (text.length() > 50000) {
                                contextBuilder.append(text, 0, 50000);
                                contextBuilder.append("\n[...nội dung bị cắt do quá dài...]");
                            } else {
                                contextBuilder.append(text);
                            }
                            docNames.add(doc.getName());
                        }
                    }
                }

                // 3. Lấy lịch sử chat gần đây (tối đa 10 tin nhắn cuối)
                List<ChatMessage> history = chatMessageRepository
                        .findByProjectIdAndUserIdOrderByCreatedAtAsc(projectId, currentUser.getId());
                List<ChatMessage> recentHistory = history.size() > 10 
                        ? history.subList(history.size() - 10, history.size()) 
                        : history;

                // 4. Build request body cho Gemini API
                String requestBody = buildGeminiRequest(question, contextBuilder.toString(), docNames, recentHistory);

                // 5. Lưu tin nhắn của user
                saveChatMessage(project, currentUser, "user", question, null);

                // 6. Gọi Gemini API (non-streaming, rồi stream về client)
                System.out.println("[AiService] Sending request to Gemini: " + requestBody);
                String response = geminiWebClient.post()
                        .uri("/models/{model}:generateContent?key={key}", modelName, apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                // 7. Parse response
                String aiAnswer = parseGeminiResponse(response);

                // 8. Stream response về client theo từng đoạn
                // Chia nhỏ câu trả lời thành các chunk để tạo hiệu ứng streaming
                int chunkSize = 15; // ~15 ký tự mỗi chunk
                for (int i = 0; i < aiAnswer.length(); i += chunkSize) {
                    int end = Math.min(i + chunkSize, aiAnswer.length());
                    String chunk = aiAnswer.substring(i, end);
                    emitter.send(SseEmitter.event().name("message").data(chunk));
                    Thread.sleep(20); // delay nhẹ cho hiệu ứng typing
                }

                // 9. Gửi event hoàn thành
                String referencedDocsJson = objectMapper.writeValueAsString(docNames);
                emitter.send(SseEmitter.event().name("done").data(referencedDocsJson));

                // 10. Lưu tin nhắn AI
                saveChatMessage(project, currentUser, "assistant", aiAnswer, referencedDocsJson);

                emitter.complete();

            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                String errorBody = e.getResponseBodyAsString();
                System.err.println("[AiService] Gemini API Error: " + e.getStatusCode() + " - " + errorBody);
                try {
                    emitter.send(SseEmitter.event().name("error").data("Lỗi API Gemini: " + errorBody));
                    emitter.complete();
                } catch (Exception ignored) {}
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event().name("error").data("Lỗi hệ thống: " + e.getMessage()));
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        });

        return emitter;
    }

    /**
     * Lấy lịch sử chat của user trong project.
     */
    public List<ChatResponse> getChatHistory(Long projectId, User currentUser) {
        // Kiểm tra quyền
        projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<ChatMessage> messages = chatMessageRepository
                .findByProjectIdAndUserIdOrderByCreatedAtAsc(projectId, currentUser.getId());

        return messages.stream().map(msg -> new ChatResponse(
                msg.getId(),
                msg.getRole(),
                msg.getContent(),
                msg.getReferencedDocs(),
                msg.getCreatedAt()
        )).collect(Collectors.toList());
    }

    /**
     * Xóa lịch sử chat.
     */
    @Transactional
    public void clearChatHistory(Long projectId, User currentUser) {
        chatMessageRepository.deleteByProjectIdAndUserId(projectId, currentUser.getId());
    }

    // ===== PRIVATE METHODS =====

    /**
     * Build JSON request body cho Gemini API.
     * Format theo: https://ai.google.dev/api/generate-content
     */
    private String buildGeminiRequest(String question, String context, List<String> docNames, List<ChatMessage> history) {
        try {
            ObjectNode root = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemPart = objectMapper.createObjectNode();
            systemPart.put("text", buildSystemPrompt(context, docNames));
            ArrayNode systemParts = objectMapper.createArrayNode();
            systemParts.add(systemPart);
            systemInstruction.set("parts", systemParts);
            root.set("systemInstruction", systemInstruction);

            // Contents (history + current question)
            ArrayNode contents = objectMapper.createArrayNode();

            // Thêm lịch sử chat: API Gemini BẮT BUỘC role phải xen kẽ (user -> model -> user -> model)
            String expectedRole = "user";
            java.util.List<ObjectNode> validContents = new java.util.ArrayList<>();

            for (ChatMessage msg : history) {
                String role = msg.getRole().equals("assistant") ? "model" : "user";
                // Bỏ qua các tin nhắn bị null hoặc rỗng
                if (msg.getContent() == null || msg.getContent().trim().isEmpty()) {
                    continue;
                }
                
                if (role.equals(expectedRole)) {
                    ObjectNode content = objectMapper.createObjectNode();
                    content.put("role", role);
                    ArrayNode parts = objectMapper.createArrayNode();
                    ObjectNode part = objectMapper.createObjectNode();
                    part.put("text", msg.getContent());
                    parts.add(part);
                    content.set("parts", parts);
                    validContents.add(content);
                    
                    expectedRole = role.equals("user") ? "model" : "user";
                }
            }
            
            // Vì chuẩn bị thêm câu hỏi hiện tại (user), lịch sử TRƯỚC ĐÓ phải kết thúc bằng "model"
            if (!validContents.isEmpty() && validContents.get(validContents.size() - 1).get("role").asText().equals("user")) {
                validContents.remove(validContents.size() - 1);
            }

            for (ObjectNode content : validContents) {
                contents.add(content);
            }

            // Thêm câu hỏi hiện tại
            ObjectNode userContent = objectMapper.createObjectNode();
            userContent.put("role", "user");
            ArrayNode userParts = objectMapper.createArrayNode();
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", question);
            userParts.add(userPart);
            userContent.set("parts", userParts);
            contents.add(userContent);

            root.set("contents", contents);

            // Generation config
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("maxOutputTokens", maxOutputTokens);
            generationConfig.put("temperature", temperature);
            root.set("generationConfig", generationConfig);

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("Error building Gemini request: " + e.getMessage());
        }
    }

    /**
     * Tạo system prompt cho AI.
     */
    private String buildSystemPrompt(String context, List<String> docNames) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là trợ lý AI thông minh của hệ thống KBase - Knowledge Base. ");
        sb.append("Nhiệm vụ của bạn là trả lời câu hỏi dựa trên nội dung các tài liệu trong dự án.\n\n");
        sb.append("QUY TẮC:\n");
        sb.append("1. Trả lời chính xác dựa trên nội dung tài liệu được cung cấp.\n");
        sb.append("2. Nếu thông tin không có trong tài liệu, hãy nói rõ rằng không tìm thấy.\n");
        sb.append("3. Khi trích dẫn, ghi rõ tên tài liệu nguồn.\n");
        sb.append("4. Trả lời bằng cùng ngôn ngữ với câu hỏi (Tiếng Việt hoặc English).\n");
        sb.append("5. Format câu trả lời bằng Markdown để dễ đọc.\n\n");

        if (!docNames.isEmpty()) {
            sb.append("TÀI LIỆU CÓ SẴN TRONG DỰ ÁN:\n");
            for (String name : docNames) {
                sb.append("- ").append(name).append("\n");
            }
            sb.append("\nNỘI DUNG TÀI LIỆU:\n");
            sb.append(context);
        } else {
            sb.append("LƯU Ý: Dự án này chưa có tài liệu nào được upload. ");
            sb.append("Hãy thông báo cho người dùng biết và trả lời dựa trên kiến thức chung nếu có thể.");
        }

        return sb.toString();
    }

    /**
     * Parse response từ Gemini API.
     */
    private String parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText("");
                }
            }
            // Kiểm tra lỗi
            JsonNode error = root.path("error");
            if (!error.isMissingNode()) {
                return "Lỗi từ Gemini API: " + error.path("message").asText("Unknown error");
            }
            return "Không thể nhận câu trả lời từ AI. Vui lòng thử lại.";
        } catch (Exception e) {
            return "Lỗi parse response: " + e.getMessage();
        }
    }

    /**
     * Lưu tin nhắn chat vào database.
     */
    private void saveChatMessage(Project project, User user, String role, String content, String referencedDocs) {
        ChatMessage message = new ChatMessage();
        message.setProject(project);
        message.setUser(user);
        message.setRole(role);
        message.setContent(content);
        message.setReferencedDocs(referencedDocs);
        chatMessageRepository.save(message);
    }
}
