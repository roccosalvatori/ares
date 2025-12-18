package com.ares.controller;

import com.ares.dto.ExecutionData;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/test-execution")
@CrossOrigin(origins = "http://localhost:4200")
public class ExecutionController {

    @GetMapping
    public ResponseEntity<ExecutionData> getTestExecution() {
        ExecutionData execution = createSampleExecution();
        return ResponseEntity.ok(execution);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ExecutionData>> getTestExecutions(@RequestParam(defaultValue = "10") int count) {
        List<ExecutionData> executions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            executions.add(createSampleExecution(i));
        }
        return ResponseEntity.ok(executions);
    }

    private ExecutionData createSampleExecution() {
        return createSampleExecution(0);
    }

    private ExecutionData createSampleExecution(int index) {
        ExecutionData execution = new ExecutionData();
        
        // String fields
        execution.setOrderId("ORD" + String.format("%06d", 100000 + index));
        execution.setIsin("US037833100" + (index % 10));
        execution.setBloombergLongTicker("AAPL US Equity");
        execution.setTrader("TRADER" + (index % 5 + 1));
        execution.setBook("BOOK" + (index % 3 + 1));
        execution.setStatus(index % 2 == 0 ? "ACK" : "PENDING");
        execution.setInstrument(index % 3 == 0 ? "STOCK" : index % 3 == 1 ? "FUTURE" : "OPTION");
        execution.setRegion(index % 4 == 0 ? "ALL" : index % 4 == 1 ? "PARIS" : index % 4 == 2 ? "AMERICAS" : "ASIA");
        execution.setMic("XNAS");
        execution.setCurrency("USD");
        execution.setSide(index % 2 == 0 ? "BUY" : "SELL");
        execution.setOrderType("LIMIT");
        execution.setTimeInForce("DAY");
        execution.setExchange("NASDAQ");
        execution.setSettlementDate("2024-12-20");
        execution.setTradeDate("2024-12-18");
        execution.setAccount("ACC" + String.format("%04d", index + 1));
        execution.setStrategy("STRATEGY" + (index % 4 + 1));
        execution.setCounterparty("CPTY" + (index % 3 + 1));
        execution.setVenue("VENUE" + (index % 2 + 1));
        execution.setOrderStatus("FILLED");
        execution.setClientId("CLIENT" + String.format("%05d", index + 1));
        execution.setPortfolio("PORT" + (index % 5 + 1));
        execution.setSector("TECHNOLOGY");
        execution.setAssetClass("EQUITY");
        
        // Numeric fields
        execution.setExecutionId(1000000L + index);
        execution.setQuantity(100 + (index * 10));
        execution.setPrice(BigDecimal.valueOf(150.50 + (index * 0.25)));
        execution.setNotional(BigDecimal.valueOf(15050.00 + (index * 25.00)));
        execution.setFillQuantity(100 + (index * 10));
        execution.setAveragePrice(BigDecimal.valueOf(150.50 + (index * 0.25)));
        execution.setCommission(5.50 + (index * 0.10));
        
        // Boolean field
        execution.setIsActive(index % 2 == 0);
        
        // DateTime field
        execution.setExecutionTime(LocalDateTime.now().minusHours(index));
        
        return execution;
    }
}

