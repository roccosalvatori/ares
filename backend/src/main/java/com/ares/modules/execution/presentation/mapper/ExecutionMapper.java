package com.ares.modules.execution.presentation.mapper;

import com.ares.modules.execution.domain.Execution;
import com.ares.modules.execution.presentation.dto.ExecutionDataDto;
import org.springframework.stereotype.Component;

/**
 * Mapper between domain Execution and DTO ExecutionDataDto.
 * Keeps presentation layer separate from domain.
 */
@Component
public class ExecutionMapper {
    
    public ExecutionDataDto toDto(Execution execution) {
        ExecutionDataDto dto = new ExecutionDataDto();
        dto.setOrderId(execution.getOrderId());
        dto.setIsin(execution.getIsin());
        dto.setBloombergLongTicker(execution.getBloombergLongTicker());
        dto.setTrader(execution.getTrader());
        dto.setBook(execution.getBook());
        dto.setStatus(execution.getStatus());
        dto.setInstrument(execution.getInstrument());
        dto.setRegion(execution.getRegion());
        dto.setMic(execution.getMic());
        dto.setExecutionId(execution.getExecutionId());
        dto.setQuantity(execution.getQuantity());
        dto.setPrice(execution.getPrice());
        dto.setNotional(execution.getNotional());
        dto.setCurrency(execution.getCurrency());
        dto.setSide(execution.getSide());
        dto.setOrderType(execution.getOrderType());
        dto.setTimeInForce(execution.getTimeInForce());
        dto.setIsActive(execution.getIsActive());
        dto.setExchange(execution.getExchange());
        dto.setSettlementDate(execution.getSettlementDate());
        dto.setTradeDate(execution.getTradeDate());
        dto.setExecutionTime(execution.getExecutionTime());
        dto.setCommission(execution.getCommission());
        dto.setAccount(execution.getAccount());
        dto.setStrategy(execution.getStrategy());
        dto.setCounterparty(execution.getCounterparty());
        dto.setVenue(execution.getVenue());
        dto.setOrderStatus(execution.getOrderStatus());
        dto.setFillQuantity(execution.getFillQuantity());
        dto.setAveragePrice(execution.getAveragePrice());
        dto.setClientId(execution.getClientId());
        dto.setPortfolio(execution.getPortfolio());
        dto.setSector(execution.getSector());
        dto.setAssetClass(execution.getAssetClass());
        return dto;
    }
}

