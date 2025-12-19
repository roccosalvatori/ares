package com.ares.controller;

import com.ares.dto.ExecutionData;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@RestController
@RequestMapping("/test-execution")
@CrossOrigin(origins = "http://localhost:4200")
public class ExecutionController {

    // In-memory cache for executions by count
    private final ConcurrentMap<Integer, List<ExecutionData>> executionsCache = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    // Diversified field values with non-uniform distribution weights
    private static final String[] STATUSES = {"ACK", "ANO", "TIMEOUT", "REJECTED", "PENDING"};
    private static final double[] STATUS_WEIGHTS = {0.40, 0.25, 0.15, 0.10, 0.10}; // ACK most common
    
    private static final String[] INSTRUMENTS = {"STOCK", "FUTURE", "OPTION", "BOND", "FOREX"};
    private static final double[] INSTRUMENT_WEIGHTS = {0.50, 0.20, 0.15, 0.10, 0.05}; // STOCK most common
    
    private static final String[] REGIONS = {"AMERICAS", "EUROPE", "ASIA", "EMEA", "ALL"};
    private static final double[] REGION_WEIGHTS = {0.35, 0.30, 0.20, 0.10, 0.05};
    
    private static final String[] MICS = {"XNAS", "XNYS", "XPAR", "XLON", "XTKS"};
    private static final double[] MIC_WEIGHTS = {0.40, 0.30, 0.15, 0.10, 0.05};
    
    private static final String[] CURRENCIES = {"USD", "EUR", "GBP", "JPY", "CHF"};
    private static final double[] CURRENCY_WEIGHTS = {0.60, 0.20, 0.10, 0.07, 0.03};
    
    private static final String[] SIDES = {"BUY", "SELL"};
    private static final double[] SIDE_WEIGHTS = {0.55, 0.45};
    
    private static final String[] ORDER_TYPES = {"LIMIT", "MARKET", "STOP", "STOP_LIMIT", "ICEBERG"};
    private static final double[] ORDER_TYPE_WEIGHTS = {0.50, 0.30, 0.10, 0.07, 0.03};
    
    private static final String[] TIME_IN_FORCE = {"DAY", "GTC", "IOC", "FOK", "GTD"};
    private static final double[] TIME_IN_FORCE_WEIGHTS = {0.60, 0.25, 0.08, 0.05, 0.02};
    
    private static final String[] EXCHANGES = {"NASDAQ", "NYSE", "LSE", "EURONEXT", "TSE"};
    private static final double[] EXCHANGE_WEIGHTS = {0.40, 0.30, 0.15, 0.10, 0.05};
    
    private static final String[] SECTORS = {"TECHNOLOGY", "FINANCE", "HEALTHCARE", "ENERGY", "CONSUMER"};
    private static final double[] SECTOR_WEIGHTS = {0.35, 0.25, 0.20, 0.12, 0.08};
    
    private static final String[] ASSET_CLASSES = {"EQUITY", "FIXED_INCOME", "DERIVATIVES", "COMMODITIES", "CURRENCY"};
    private static final double[] ASSET_CLASS_WEIGHTS = {0.55, 0.20, 0.15, 0.07, 0.03};
    
    private static final String[] ORDER_STATUSES = {"FILLED", "PARTIAL", "PENDING", "CANCELLED", "REJECTED"};
    private static final double[] ORDER_STATUS_WEIGHTS = {0.50, 0.20, 0.15, 0.10, 0.05};

    @GetMapping
    public ResponseEntity<ExecutionData> getTestExecution() {
        ExecutionData execution = createSampleExecution();
        return ResponseEntity.ok(execution);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ExecutionData>> getTestExecutions(@RequestParam(defaultValue = "2000") int count) {
        // Use cache to avoid regenerating executions
        List<ExecutionData> executions = executionsCache.computeIfAbsent(count, k -> {
            List<ExecutionData> newExecutions = new ArrayList<>();
            for (int i = 0; i < k; i++) {
                newExecutions.add(createSampleExecution(i));
            }
            return newExecutions;
        });
        
        // Return a copy to prevent external modifications
        return ResponseEntity.ok(new ArrayList<>(executions));
    }
    
    @DeleteMapping("/cache")
    public ResponseEntity<String> clearCache() {
        executionsCache.clear();
        return ResponseEntity.ok("Cache cleared");
    }

    private ExecutionData createSampleExecution() {
        return createSampleExecution(0);
    }

    private ExecutionData createSampleExecution(int index) {
        ExecutionData execution = new ExecutionData();
        
        // String fields with weighted random distribution
        execution.setOrderId("ORD" + String.format("%06d", 100000 + index));
        execution.setIsin("US" + String.format("%010d", 37833100 + (index % 15)));
        execution.setBloombergLongTicker(getBloombergTicker(index));
        execution.setTrader("TRADER" + (index % 8 + 1)); // 8 traders, non-uniform
        execution.setBook("BOOK" + (index % 6 + 1)); // 6 books
        execution.setStatus(selectWeighted(STATUSES, STATUS_WEIGHTS));
        execution.setInstrument(selectWeighted(INSTRUMENTS, INSTRUMENT_WEIGHTS));
        execution.setRegion(selectWeighted(REGIONS, REGION_WEIGHTS));
        execution.setMic(selectWeighted(MICS, MIC_WEIGHTS));
        execution.setCurrency(selectWeighted(CURRENCIES, CURRENCY_WEIGHTS));
        execution.setSide(selectWeighted(SIDES, SIDE_WEIGHTS));
        execution.setOrderType(selectWeighted(ORDER_TYPES, ORDER_TYPE_WEIGHTS));
        execution.setTimeInForce(selectWeighted(TIME_IN_FORCE, TIME_IN_FORCE_WEIGHTS));
        execution.setExchange(selectWeighted(EXCHANGES, EXCHANGE_WEIGHTS));
        execution.setSettlementDate("2024-12-20");
        execution.setTradeDate("2024-12-18");
        execution.setAccount("ACC" + String.format("%04d", (index % 10) + 1));
        execution.setStrategy("STRATEGY" + (index % 7 + 1));
        execution.setCounterparty("CPTY" + (index % 6 + 1));
        execution.setVenue("VENUE" + (index % 5 + 1));
        execution.setOrderStatus(selectWeighted(ORDER_STATUSES, ORDER_STATUS_WEIGHTS));
        execution.setClientId("CLIENT" + String.format("%05d", index + 1));
        execution.setPortfolio("PORT" + (index % 8 + 1));
        execution.setSector(selectWeighted(SECTORS, SECTOR_WEIGHTS));
        execution.setAssetClass(selectWeighted(ASSET_CLASSES, ASSET_CLASS_WEIGHTS));
        
        // Numeric fields with random variation
        execution.setExecutionId(1000000L + index);
        execution.setQuantity(50 + random.nextInt(950)); // Random 50-1000
        execution.setPrice(BigDecimal.valueOf(10.0 + random.nextDouble() * 500.0)); // Random 10-510
        execution.setNotional(execution.getPrice().multiply(BigDecimal.valueOf(execution.getQuantity())));
        execution.setFillQuantity(execution.getQuantity());
        execution.setAveragePrice(execution.getPrice());
        execution.setCommission(0.5 + random.nextDouble() * 15.0); // Random 0.5-15.5
        
        // Boolean field
        execution.setIsActive(random.nextDouble() < 0.7); // 70% active
        
        // DateTime field - all on same day, non-uniform distribution with peak at 17:00
        execution.setExecutionTime(generateExecutionTime(index));
        
        return execution;
    }
    
    private String selectWeighted(String[] options, double[] weights) {
        double rand = random.nextDouble();
        double cumulative = 0.0;
        for (int i = 0; i < options.length; i++) {
            cumulative += weights[i];
            if (rand < cumulative) {
                return options[i];
            }
        }
        return options[options.length - 1];
    }
    
    private String getBloombergTicker(int index) {
        String[] tickers = {"AAPL US Equity", "MSFT US Equity", "GOOGL US Equity", "AMZN US Equity", "TSLA US Equity",
                           "META US Equity", "NVDA US Equity", "JPM US Equity", "V US Equity", "WMT US Equity"};
        return tickers[index % tickers.length];
    }
    
    /**
     * Generate execution time distributed throughout a single day with peak at 17:00
     * Non-uniform distribution: peak at 17:00, high activity 14:00-18:00, low activity overnight
     */
    private LocalDateTime generateExecutionTime(int index) {
        // Base date - all executions on the same day (2024-12-18)
        LocalDateTime baseDate = LocalDateTime.of(2024, 12, 18, 0, 0, 0);
        
        // Generate hour with weighted distribution (peak at 17:00)
        int hour;
        double rand = random.nextDouble();
        
        if (rand < 0.30) {
            // Peak hour (17:00) - 30% of executions
            hour = 17;
        } else if (rand < 0.50) {
            // High activity hours (16:00, 18:00) - 20% of executions
            hour = random.nextDouble() < 0.5 ? 16 : 18;
        } else if (rand < 0.70) {
            // Medium-high activity (15:00, 19:00) - 20% of executions
            hour = random.nextDouble() < 0.5 ? 15 : 19;
        } else if (rand < 0.85) {
            // Medium activity (13:00, 14:00, 20:00, 21:00) - 15% of executions
            int[] hours = {13, 14, 20, 21};
            hour = hours[random.nextInt(hours.length)];
        } else if (rand < 0.95) {
            // Regular hours (9:00-12:00, 22:00) - 10% of executions
            int[] hours = {9, 10, 11, 12, 22};
            hour = hours[random.nextInt(hours.length)];
        } else {
            // Low activity hours (0:00-8:00, 23:00) - 5% of executions
            int[] hours = {0, 1, 2, 3, 4, 5, 6, 7, 8, 23};
            hour = hours[random.nextInt(hours.length)];
        }
        
        // Generate random minutes and seconds
        int minute = random.nextInt(60);
        int second = random.nextInt(60);
        
        return baseDate.withHour(hour).withMinute(minute).withSecond(second);
    }
}

