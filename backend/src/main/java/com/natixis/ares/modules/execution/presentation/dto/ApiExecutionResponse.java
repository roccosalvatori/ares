package com.natixis.ares.modules.execution.presentation.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for API execution response structure.
 * Matches the structure returned by the external API.
 */
public class ApiExecutionResponse {
    
    @JsonProperty("executions")
    private List<ApiExecution> executions;
    
    public ApiExecutionResponse() {
    }
    
    public List<ApiExecution> getExecutions() {
        return executions;
    }
    
    public void setExecutions(List<ApiExecution> executions) {
        this.executions = executions;
    }
    
    /**
     * Inner class representing a single execution from the API.
     */
    public static class ApiExecution {
        @JsonProperty("tradeId")
        private String tradeId;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("executionState")
        private String executionState;
        
        @JsonProperty("userId")
        private String userId;
        
        @JsonProperty("productId")
        private String productId;
        
        @JsonProperty("sessionId")
        private String sessionId;
        
        @JsonProperty("imsId")
        private String imsId;
        
        @JsonProperty("toHedge")
        private Boolean toHedge;
        
        @JsonProperty("marketData")
        private String marketData;
        
        @JsonProperty("brokerExchangeId")
        private String brokerExchangeId;
        
        @JsonProperty("way")
        private String way;
        
        @JsonProperty("userData")
        private String userData;
        
        @JsonProperty("context")
        private String context;
        
        @JsonProperty("price")
        private BigDecimal price;
        
        @JsonProperty("orderId")
        private String orderId;
        
        @JsonProperty("timestamp")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        private LocalDateTime timestamp;
        
        @JsonProperty("portfolioId")
        private String portfolioId;
        
        @JsonProperty("imsUserId")
        private String imsUserId;
        
        @JsonProperty("mic")
        private String mic;
        
        @JsonProperty("isComplete")
        private Boolean isComplete;
        
        @JsonProperty("marketTradeId")
        private String marketTradeId;
        
        @JsonProperty("shortSellType")
        private String shortSellType;
        
        @JsonProperty("tradeType")
        private String tradeType;
        
        @JsonProperty("eventTimestamp")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        private LocalDateTime eventTimestamp;
        
        @JsonProperty("version")
        private Integer version;
        
        @JsonProperty("brokerageFees")
        private BigDecimal brokerageFees;
        
        @JsonProperty("clearingFees")
        private BigDecimal clearingFees;
        
        @JsonProperty("crossTradeId")
        private String crossTradeId;
        
        @JsonProperty("currencyId")
        private String currencyId;
        
        @JsonProperty("exchangeFees")
        private BigDecimal exchangeFees;
        
        @JsonProperty("feesData")
        private String feesData;
        
        @JsonProperty("hedgeProxyUlSpot")
        private BigDecimal hedgeProxyUlSpot;
        
        @JsonProperty("hedgeRatio")
        private BigDecimal hedgeRatio;
        
        @JsonProperty("hedgeUlId")
        private String hedgeUlId;
        
        @JsonProperty("hedgeUlSpot")
        private BigDecimal hedgeUlSpot;
        
        @JsonProperty("ignoreInPosition")
        private Boolean ignoreInPosition;
        
        @JsonProperty("productToHedgeForex")
        private BigDecimal productToHedgeForex;
        
        @JsonProperty("brokerName")
        private String brokerName;
        
        @JsonProperty("immediateHedgePercent")
        private BigDecimal immediateHedgePercent;
        
        @JsonProperty("immediateHedgeStrategy")
        private String immediateHedgeStrategy;
        
        @JsonProperty("originalOrderPrice")
        private BigDecimal originalOrderPrice;
        
        @JsonProperty("orderTimestamp")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        private LocalDateTime orderTimestamp;
        
        @JsonProperty("execMarketData")
        private String execMarketData;
        
        @JsonProperty("settlementFees")
        private BigDecimal settlementFees;
        
        @JsonProperty("settlementDate")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
        private LocalDateTime settlementDate;
        
        @JsonProperty("comment")
        private String comment;
        
        @JsonProperty("imsChannelType")
        private Integer imsChannelType;
        
        @JsonProperty("productToPositionForex")
        private BigDecimal productToPositionForex;
        
        @JsonProperty("pricingSnapStatus")
        private String pricingSnapStatus;
        
        @JsonProperty("hedgeSnapStatus")
        private String hedgeSnapStatus;
        
        @JsonProperty("forexSnapStatus")
        private String forexSnapStatus;
        
        @JsonProperty("hedgeForexSnapStatus")
        private String hedgeForexSnapStatus;
        
        @JsonProperty("strategyId")
        private String strategyId;
        
        @JsonProperty("peerCustomFields")
        private String peerCustomFields;
        
        @JsonProperty("peerUid")
        private String peerUid;
        
        @JsonProperty("blockTradeType")
        private String blockTradeType;
        
        @JsonProperty("marketToPricingForex")
        private BigDecimal marketToPricingForex;
        
        @JsonProperty("immediateHedgeMode")
        private String immediateHedgeMode;
        
        @JsonProperty("originalOrderQuantityD")
        private BigDecimal originalOrderQuantityD;
        
        @JsonProperty("quantity")
        private BigDecimal quantity;
        
        // Getters and Setters
        public String getTradeId() { return tradeId; }
        public void setTradeId(String tradeId) { this.tradeId = tradeId; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getExecutionState() { return executionState; }
        public void setExecutionState(String executionState) { this.executionState = executionState; }
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        
        public String getImsId() { return imsId; }
        public void setImsId(String imsId) { this.imsId = imsId; }
        
        public Boolean getToHedge() { return toHedge; }
        public void setToHedge(Boolean toHedge) { this.toHedge = toHedge; }
        
        public String getMarketData() { return marketData; }
        public void setMarketData(String marketData) { this.marketData = marketData; }
        
        public String getBrokerExchangeId() { return brokerExchangeId; }
        public void setBrokerExchangeId(String brokerExchangeId) { this.brokerExchangeId = brokerExchangeId; }
        
        public String getWay() { return way; }
        public void setWay(String way) { this.way = way; }
        
        public String getUserData() { return userData; }
        public void setUserData(String userData) { this.userData = userData; }
        
        public String getContext() { return context; }
        public void setContext(String context) { this.context = context; }
        
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public String getPortfolioId() { return portfolioId; }
        public void setPortfolioId(String portfolioId) { this.portfolioId = portfolioId; }
        
        public String getImsUserId() { return imsUserId; }
        public void setImsUserId(String imsUserId) { this.imsUserId = imsUserId; }
        
        public String getMic() { return mic; }
        public void setMic(String mic) { this.mic = mic; }
        
        public Boolean getIsComplete() { return isComplete; }
        public void setIsComplete(Boolean isComplete) { this.isComplete = isComplete; }
        
        public String getMarketTradeId() { return marketTradeId; }
        public void setMarketTradeId(String marketTradeId) { this.marketTradeId = marketTradeId; }
        
        public String getShortSellType() { return shortSellType; }
        public void setShortSellType(String shortSellType) { this.shortSellType = shortSellType; }
        
        public String getTradeType() { return tradeType; }
        public void setTradeType(String tradeType) { this.tradeType = tradeType; }
        
        public LocalDateTime getEventTimestamp() { return eventTimestamp; }
        public void setEventTimestamp(LocalDateTime eventTimestamp) { this.eventTimestamp = eventTimestamp; }
        
        public Integer getVersion() { return version; }
        public void setVersion(Integer version) { this.version = version; }
        
        public BigDecimal getBrokerageFees() { return brokerageFees; }
        public void setBrokerageFees(BigDecimal brokerageFees) { this.brokerageFees = brokerageFees; }
        
        public BigDecimal getClearingFees() { return clearingFees; }
        public void setClearingFees(BigDecimal clearingFees) { this.clearingFees = clearingFees; }
        
        public String getCrossTradeId() { return crossTradeId; }
        public void setCrossTradeId(String crossTradeId) { this.crossTradeId = crossTradeId; }
        
        public String getCurrencyId() { return currencyId; }
        public void setCurrencyId(String currencyId) { this.currencyId = currencyId; }
        
        public BigDecimal getExchangeFees() { return exchangeFees; }
        public void setExchangeFees(BigDecimal exchangeFees) { this.exchangeFees = exchangeFees; }
        
        public String getFeesData() { return feesData; }
        public void setFeesData(String feesData) { this.feesData = feesData; }
        
        public BigDecimal getHedgeProxyUlSpot() { return hedgeProxyUlSpot; }
        public void setHedgeProxyUlSpot(BigDecimal hedgeProxyUlSpot) { this.hedgeProxyUlSpot = hedgeProxyUlSpot; }
        
        public BigDecimal getHedgeRatio() { return hedgeRatio; }
        public void setHedgeRatio(BigDecimal hedgeRatio) { this.hedgeRatio = hedgeRatio; }
        
        public String getHedgeUlId() { return hedgeUlId; }
        public void setHedgeUlId(String hedgeUlId) { this.hedgeUlId = hedgeUlId; }
        
        public BigDecimal getHedgeUlSpot() { return hedgeUlSpot; }
        public void setHedgeUlSpot(BigDecimal hedgeUlSpot) { this.hedgeUlSpot = hedgeUlSpot; }
        
        public Boolean getIgnoreInPosition() { return ignoreInPosition; }
        public void setIgnoreInPosition(Boolean ignoreInPosition) { this.ignoreInPosition = ignoreInPosition; }
        
        public BigDecimal getProductToHedgeForex() { return productToHedgeForex; }
        public void setProductToHedgeForex(BigDecimal productToHedgeForex) { this.productToHedgeForex = productToHedgeForex; }
        
        public String getBrokerName() { return brokerName; }
        public void setBrokerName(String brokerName) { this.brokerName = brokerName; }
        
        public BigDecimal getImmediateHedgePercent() { return immediateHedgePercent; }
        public void setImmediateHedgePercent(BigDecimal immediateHedgePercent) { this.immediateHedgePercent = immediateHedgePercent; }
        
        public String getImmediateHedgeStrategy() { return immediateHedgeStrategy; }
        public void setImmediateHedgeStrategy(String immediateHedgeStrategy) { this.immediateHedgeStrategy = immediateHedgeStrategy; }
        
        public BigDecimal getOriginalOrderPrice() { return originalOrderPrice; }
        public void setOriginalOrderPrice(BigDecimal originalOrderPrice) { this.originalOrderPrice = originalOrderPrice; }
        
        public LocalDateTime getOrderTimestamp() { return orderTimestamp; }
        public void setOrderTimestamp(LocalDateTime orderTimestamp) { this.orderTimestamp = orderTimestamp; }
        
        public String getExecMarketData() { return execMarketData; }
        public void setExecMarketData(String execMarketData) { this.execMarketData = execMarketData; }
        
        public BigDecimal getSettlementFees() { return settlementFees; }
        public void setSettlementFees(BigDecimal settlementFees) { this.settlementFees = settlementFees; }
        
        public LocalDateTime getSettlementDate() { return settlementDate; }
        public void setSettlementDate(LocalDateTime settlementDate) { this.settlementDate = settlementDate; }
        
        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
        
        public Integer getImsChannelType() { return imsChannelType; }
        public void setImsChannelType(Integer imsChannelType) { this.imsChannelType = imsChannelType; }
        
        public BigDecimal getProductToPositionForex() { return productToPositionForex; }
        public void setProductToPositionForex(BigDecimal productToPositionForex) { this.productToPositionForex = productToPositionForex; }
        
        public String getPricingSnapStatus() { return pricingSnapStatus; }
        public void setPricingSnapStatus(String pricingSnapStatus) { this.pricingSnapStatus = pricingSnapStatus; }
        
        public String getHedgeSnapStatus() { return hedgeSnapStatus; }
        public void setHedgeSnapStatus(String hedgeSnapStatus) { this.hedgeSnapStatus = hedgeSnapStatus; }
        
        public String getForexSnapStatus() { return forexSnapStatus; }
        public void setForexSnapStatus(String forexSnapStatus) { this.forexSnapStatus = forexSnapStatus; }
        
        public String getHedgeForexSnapStatus() { return hedgeForexSnapStatus; }
        public void setHedgeForexSnapStatus(String hedgeForexSnapStatus) { this.hedgeForexSnapStatus = hedgeForexSnapStatus; }
        
        public String getStrategyId() { return strategyId; }
        public void setStrategyId(String strategyId) { this.strategyId = strategyId; }
        
        public String getPeerCustomFields() { return peerCustomFields; }
        public void setPeerCustomFields(String peerCustomFields) { this.peerCustomFields = peerCustomFields; }
        
        public String getPeerUid() { return peerUid; }
        public void setPeerUid(String peerUid) { this.peerUid = peerUid; }
        
        public String getBlockTradeType() { return blockTradeType; }
        public void setBlockTradeType(String blockTradeType) { this.blockTradeType = blockTradeType; }
        
        public BigDecimal getMarketToPricingForex() { return marketToPricingForex; }
        public void setMarketToPricingForex(BigDecimal marketToPricingForex) { this.marketToPricingForex = marketToPricingForex; }
        
        public String getImmediateHedgeMode() { return immediateHedgeMode; }
        public void setImmediateHedgeMode(String immediateHedgeMode) { this.immediateHedgeMode = immediateHedgeMode; }
        
        public BigDecimal getOriginalOrderQuantityD() { return originalOrderQuantityD; }
        public void setOriginalOrderQuantityD(BigDecimal originalOrderQuantityD) { this.originalOrderQuantityD = originalOrderQuantityD; }
        
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    }
}

