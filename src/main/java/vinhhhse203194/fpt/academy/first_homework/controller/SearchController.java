package vinhhhse203194.fpt.academy.first_homework.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vinhhhse203194.fpt.academy.first_homework.dto.SearchResultResponse;
import vinhhhse203194.fpt.academy.first_homework.security.CustomUserDetails;
import vinhhhse203194.fpt.academy.first_homework.service.SearchService;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResultResponse> searchGlobal(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("q") String keyword) {
        SearchResultResponse result = searchService.searchGlobal(userDetails.getUser(), keyword);
        return ResponseEntity.ok(result);
    }
}
