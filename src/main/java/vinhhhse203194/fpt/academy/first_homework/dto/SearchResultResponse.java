package vinhhhse203194.fpt.academy.first_homework.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchResultResponse {
    private List<ProjectResponse> projects;
    private List<ProjectMemberResponse> users;
    private List<DocumentResponse> documents;
}
