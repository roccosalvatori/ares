package com.natixis.ares.modules.execution.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Simplified Execution model for caching.
 * Only contains fields that are displayed in the table (table-columns.json).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CachedExecution {
    private String orderId;
    private String isin;
    private String side;
    private String trader;
    private String book;
    private String status;
    private String instrument;
    private String region;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal notional;
    private String currency;
    private LocalDateTime executionTime;
    private String instrumentType;
    private String mic;
    private String tradeId; // For deduplication

    // Constructors
    public CachedExecution() {
    }

    // Getters and Setters
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getIsin() { return isin; }
    public void setIsin(String isin) { this.isin = isin; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public String getTrader() { return trader; }
    public void setTrader(String trader) { this.trader = trader; }

    public String getBook() { return book; }
    public void setBook(String book) { this.book = book; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInstrument() { return instrument; }
    public void setInstrument(String instrument) { this.instrument = instrument; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getNotional() { return notional; }
    public void setNotional(BigDecimal notional) { this.notional = notional; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDateTime getExecutionTime() { return executionTime; }
    public void setExecutionTime(LocalDateTime executionTime) { this.executionTime = executionTime; }

    public String getInstrumentType() { return instrumentType; }
    public void setInstrumentType(String instrumentType) { this.instrumentType = instrumentType; }

    public String getMic() { return mic; }
    public void setMic(String mic) { this.mic = mic; }

    public String getTradeId() { return tradeId; }
    public void setTradeId(String tradeId) { this.tradeId = tradeId; }

    /**
     * Convert from Execution domain model to CachedExecution
     */
    public static CachedExecution fromExecution(Execution execution) {
        CachedExecution cached = new CachedExecution();
        cached.setOrderId(execution.getOrderId());
        cached.setIsin(execution.getIsin());
        cached.setSide(execution.getSide());
        cached.setTrader(execution.getTrader());
        cached.setBook(execution.getBook());
        cached.setStatus(execution.getStatus());
        cached.setInstrument(execution.getInstrument());
        cached.setRegion(execution.getRegion());
        cached.setQuantity(execution.getQuantity());
        cached.setPrice(execution.getPrice());
        cached.setNotional(execution.getNotional());
        cached.setCurrency(execution.getCurrency());
        cached.setExecutionTime(execution.getExecutionTime());
        cached.setInstrumentType(execution.getInstrumentType());
        cached.setMic(execution.getMic());
        cached.setTradeId(execution.getTradeId());
        return cached;
    }

    /**
     * Convert from CachedExecution to Execution domain model
     */
    public Execution toExecution() {
        Execution execution = new Execution();
        execution.setOrderId(this.orderId);
        execution.setIsin(this.isin);
        execution.setSide(this.side);
        execution.setTrader(this.trader);
        execution.setBook(this.book);
        execution.setStatus(this.status);
        execution.setInstrument(this.instrument);
        execution.setRegion(this.region);
        execution.setQuantity(this.quantity);
        execution.setPrice(this.price);
        execution.setNotional(this.notional);
        execution.setCurrency(this.currency);
        execution.setExecutionTime(this.executionTime);
        execution.setInstrumentType(this.instrumentType);
        execution.setMic(this.mic);
        execution.setTradeId(this.tradeId);
        return execution;
    }
}

