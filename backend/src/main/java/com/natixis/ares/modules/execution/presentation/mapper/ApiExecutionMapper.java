package com.natixis.ares.modules.execution.presentation.mapper;

import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Mapper from API execution response to Execution domain model.
 * Maps only fields that exist in the table configuration.
 */
@Component
public class ApiExecutionMapper {
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    
    /**
     * Maps an API execution to Execution domain model.
     * Only maps fields that exist in the table configuration (table-columns.json).
     * Fields not in table-columns.json are not mapped.
     */
    public Execution toDomain(ApiExecutionResponse.ApiExecution apiExecution) {
        Execution execution = new Execution();
        
        // Map only fields that exist in table-columns.json according to mapping rules
        
        // orderId = orderId (in table)
        execution.setOrderId(apiExecution.getOrderId());
        
        // trader = userId (in table)
        execution.setTrader(apiExecution.getUserId());
        
        // book = right part of portfolioId after the "-" (in table)
        if (apiExecution.getPortfolioId() != null && apiExecution.getPortfolioId().contains("-")) {
            String[] parts = apiExecution.getPortfolioId().split("-", 2);
            if (parts.length > 1) {
                execution.setBook(parts[1]);
            }
        }
        
        // instrument = productId (in table)
        execution.setInstrument(apiExecution.getProductId());
        
        // quantity = quantity (in table) - BigDecimal to Integer
        if (apiExecution.getQuantity() != null) {
            execution.setQuantity(apiExecution.getQuantity().intValue());
        }
        
        // price = price (in table)
        execution.setPrice(apiExecution.getPrice());
        
        // notional = price * quantity (in table) - calculated
        if (apiExecution.getPrice() != null && apiExecution.getQuantity() != null) {
            execution.setNotional(apiExecution.getPrice().multiply(apiExecution.getQuantity()));
        }
        
        // currency = currencyId (in table)
        execution.setCurrency(apiExecution.getCurrencyId());
        
        // side = way (in table) - convert "B" to "BUY" and "S" to "SELL"
        String way = apiExecution.getWay();
        if (way != null) {
            String trimmedWay = way.trim().toUpperCase();
            if ("B".equals(trimmedWay)) {
                execution.setSide("BUY");
            } else if ("S".equals(trimmedWay)) {
                execution.setSide("SELL");
            } else {
                // If already "BUY" or "SELL", keep as is
                execution.setSide(trimmedWay);
            }
        }
        
        // executionTime = timestamp (in table)
        execution.setExecutionTime(apiExecution.getTimestamp());
        
        // instrumentType = type (if type is "CASH_EXECUTTION" or "CASH-EXECUTION", set to "stock")
        String type = apiExecution.getType();
        if (type != null) {
            String normalizedType = type.trim().toUpperCase().replace("-", "_");
            if ("CASH_EXECUTTION".equals(normalizedType)) {
                execution.setInstrumentType("stock");
            } else {
                execution.setInstrumentType(null);
            }
        }
        
        // region = "paris" (in table) - set for all API executions
        execution.setRegion("paris");
        
        // mic = mic (in table)
        execution.setMic(apiExecution.getMic());
        
        // tradeId = tradeId (for deduplication, not in table but needed for cache)
        execution.setTradeId(apiExecution.getTradeId());
        
        // Fields in table-columns.json but not in mapping rules - set to null
        // These are: isin, status
        execution.setIsin(null);
        execution.setStatus(null);
        
        // All other fields not in table-columns.json are not set (remain null)
        // This includes: executionId, tradeDate, and all other fields
        
        return execution;
    }
    
    private String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
}

