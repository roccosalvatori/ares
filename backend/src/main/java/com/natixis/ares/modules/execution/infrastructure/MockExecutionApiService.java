package com.natixis.ares.modules.execution.infrastructure;

import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Mock service for external execution API.
 * Returns sample data matching the API response structure.
 * In production, this would be replaced with actual API client.
 */
@Component
public class MockExecutionApiService {
    
    /**
     * Fetches executions from the external API (mocked).
     * Returns sample data matching the API response structure.
     */
    public ApiExecutionResponse fetchExecutions() {
        ApiExecutionResponse response = new ApiExecutionResponse();
        List<ApiExecutionResponse.ApiExecution> executions = new ArrayList<>();
        
        // Generate sample executions matching the API structure
        for (int i = 0; i < 10; i++) {
            ApiExecutionResponse.ApiExecution execution = new ApiExecutionResponse.ApiExecution();
            
            execution.setTradeId("4567-morganstanley" + (87654 + i));
            execution.setType("CASH_EXECUTTION");
            execution.setExecutionState("INSERTED");
            execution.setUserId("etfs_121_exec_europe_uat");
            execution.setProductId("VOD@XLON");
            execution.setSessionId("fix:MorganStanley-morganstanley");
            execution.setImsId("morganstanley");
            execution.setToHedge(false);
            execution.setMarketData("[0x21100011=56yhgfrt8 0x40000000=5Cgfd-876587 0x95c0021=1]");
            execution.setBrokerExchangeId(null);
            execution.setWay(i % 2 == 0 ? "B" : "S");
            execution.setUserData("IUYFTDs98765");
            execution.setContext("default");
            execution.setPrice(BigDecimal.valueOf(96.2 + i * 0.5));
            execution.setOrderId("dytfgdhez:" + (654345678 + i));
            execution.setTimestamp(LocalDateTime.now().minusHours(i));
            execution.setPortfolioId("5C4D-" + (865444 + i));
            execution.setImsUserId("etfs_gateway-uat");
            execution.setMic("XLON");
            execution.setIsComplete(true);
            execution.setMarketTradeId("28554" + i);
            execution.setShortSellType("NONE");
            execution.setTradeType("regular");
            execution.setEventTimestamp(LocalDateTime.now().minusHours(i));
            execution.setVersion(0);
            execution.setBrokerageFees(BigDecimal.ZERO);
            execution.setClearingFees(BigDecimal.ZERO);
            execution.setCrossTradeId(null);
            execution.setCurrencyId("GBX");
            execution.setExchangeFees(BigDecimal.ZERO);
            execution.setFeesData(null);
            execution.setHedgeProxyUlSpot(BigDecimal.ONE);
            execution.setHedgeRatio(BigDecimal.ONE);
            execution.setHedgeUlId("");
            execution.setHedgeUlSpot(BigDecimal.ONE);
            execution.setIgnoreInPosition(false);
            execution.setProductToHedgeForex(BigDecimal.ONE);
            execution.setBrokerName(null);
            execution.setImmediateHedgePercent(BigDecimal.ZERO);
            execution.setImmediateHedgeStrategy(null);
            execution.setOriginalOrderPrice(BigDecimal.ZERO);
            execution.setOrderTimestamp(LocalDateTime.now().minusHours(i).minusMinutes(5));
            execution.setExecMarketData("[0x21100011=56yhgfrt8 0x40000000=5Cgfd-876587 0x95c0021=1 0x40010=BATE]");
            execution.setSettlementFees(BigDecimal.ZERO);
            execution.setSettlementDate(null);
            execution.setComment(null);
            execution.setImsChannelType(100);
            execution.setProductToPositionForex(BigDecimal.valueOf(0.011098765432134));
            execution.setPricingSnapStatus("OK");
            execution.setHedgeSnapStatus("OK");
            execution.setForexSnapStatus("OK");
            execution.setHedgeForexSnapStatus("OK");
            execution.setStrategyId(null);
            execution.setPeerCustomFields(null);
            execution.setPeerUid(null);
            execution.setBlockTradeType(null);
            execution.setMarketToPricingForex(BigDecimal.ONE);
            execution.setImmediateHedgeMode(null);
            execution.setOriginalOrderQuantityD(BigDecimal.valueOf(10.0 + i));
            execution.setQuantity(BigDecimal.valueOf(10.0 + i));
            
            executions.add(execution);
        }
        
        response.setExecutions(executions);
        return response;
    }
}

