package com.ares.modules.execution.presentation;

import com.ares.modules.execution.application.ClearCacheUseCase;
import com.ares.modules.execution.application.GetExecutionsUseCase;
import com.ares.modules.execution.domain.Execution;
import com.ares.modules.execution.presentation.dto.ExecutionDataDto;
import com.ares.modules.execution.presentation.mapper.ExecutionMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    private final ClearCacheUseCase clearCacheUseCase;
    private final ExecutionMapper mapper;
    
    public ExecutionController(
            GetExecutionsUseCase getExecutionsUseCase,
            ClearCacheUseCase clearCacheUseCase,
            ExecutionMapper mapper) {
        this.getExecutionsUseCase = getExecutionsUseCase;
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
}

