package com.natixis.ares.modules.datasource.presentation;

import com.natixis.ares.modules.datasource.application.PingDatasourceUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for datasource endpoints.
 * Presentation layer - only handles HTTP concerns.
 */
@RestController
@RequestMapping("/datasource")
@CrossOrigin(origins = "*")
public class DatasourceController {
    
    private final PingDatasourceUseCase pingDatasourceUseCase;
    
    public DatasourceController(PingDatasourceUseCase pingDatasourceUseCase) {
        this.pingDatasourceUseCase = pingDatasourceUseCase;
    }
    
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Boolean>> ping() {
        Map<String, Boolean> response = new HashMap<>();
        boolean isAvailable = pingDatasourceUseCase.execute();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }
}

