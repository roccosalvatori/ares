package com.natixis.ares.modules.execution.presentation;

import com.natixis.ares.modules.execution.application.ClearCacheUseCase;
import com.natixis.ares.modules.execution.application.FetchApiExecutionsUseCase;
import com.natixis.ares.modules.execution.application.FetchRealApiExecutionsUseCase;
import com.natixis.ares.modules.execution.application.GetExecutionsUseCase;
import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.presentation.dto.ExecutionDataDto;
import com.natixis.ares.modules.execution.presentation.mapper.ExecutionMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for execution endpoints.
 * Presentation layer - only handles HTTP concerns.
 */
@RestController
@RequestMapping("/test-execution")
@CrossOrigin(origins = "*")
public class ExecutionController {
    
    private final GetExecutionsUseCase getExecutionsUseCase;
    private final FetchApiExecutionsUseCase fetchApiExecutionsUseCase;
    private final FetchRealApiExecutionsUseCase fetchRealApiExecutionsUseCase;
    private final ClearCacheUseCase clearCacheUseCase;
    private final ExecutionMapper mapper;
    
    public ExecutionController(
            GetExecutionsUseCase getExecutionsUseCase,
            FetchApiExecutionsUseCase fetchApiExecutionsUseCase,
            FetchRealApiExecutionsUseCase fetchRealApiExecutionsUseCase,
            ClearCacheUseCase clearCacheUseCase,
            ExecutionMapper mapper) {
        this.getExecutionsUseCase = getExecutionsUseCase;
        this.fetchApiExecutionsUseCase = fetchApiExecutionsUseCase;
        this.fetchRealApiExecutionsUseCase = fetchRealApiExecutionsUseCase;
        this.clearCacheUseCase = clearCacheUseCase;
        this.mapper = mapper;
    }
    
    @GetMapping
    public ResponseEntity<ExecutionDataDto> getTestExecution() {
        List<Execution> executions = getExecutionsUseCase.execute(1);
        ExecutionDataDto dto = mapper.toDto(executions.get(0));
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<ExecutionDataDto>> getTestExecutions(
            @RequestParam(defaultValue = "2000") int count) {
        List<Execution> executions = getExecutionsUseCase.execute(count);
        List<ExecutionDataDto> dtos = executions.stream()
            .map(mapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @DeleteMapping("/cache")
    public ResponseEntity<String> clearCache() {
        clearCacheUseCase.execute();
        return ResponseEntity.ok("Cache cleared");
    }
    
    @PostMapping("/test-api-executions")
    public ResponseEntity<List<ExecutionDataDto>> fetchApiExecutions() {
        List<Execution> executions = fetchApiExecutionsUseCase.execute();
        List<ExecutionDataDto> dtos = executions.stream()
            .map(mapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @PostMapping("/test-real")
    public ResponseEntity<List<ExecutionDataDto>> fetchRealApiExecutions(
            @RequestBody(required = false) Map<String, String> requestBody) {
        String startTimestamp = requestBody != null ? requestBody.get("startTimestamp") : null;
        List<Execution> executions = fetchRealApiExecutionsUseCase.execute(startTimestamp);
        List<ExecutionDataDto> dtos = executions.stream()
            .map(mapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}

