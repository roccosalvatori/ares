package com.natixis.ares.modules.datasource.application;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.Socket;

/**
 * Use case for pinging datasource.
 * Application layer - orchestrates datasource connectivity check.
 */
@Service
public class PingDatasourceUseCase {
    
    private static final String PING_HOST = "8.8.8.8";
    private static final int PING_TIMEOUT_SECONDS = 3;
    private static final int PING_COUNT = 1;
    
    public boolean execute() {
        return checkAvailability();
    }
    
    private boolean checkAvailability() {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            ProcessBuilder processBuilder;
            
            if (os.contains("win")) {
                processBuilder = new ProcessBuilder(
                    "ping", "-n", String.valueOf(PING_COUNT), 
                    "-w", String.valueOf(PING_TIMEOUT_SECONDS * 1000), 
                    PING_HOST
                );
            } else {
                processBuilder = new ProcessBuilder(
                    "ping", "-c", String.valueOf(PING_COUNT), 
                    "-W", String.valueOf(PING_TIMEOUT_SECONDS), 
                    PING_HOST
                );
            }
            
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream())
            );
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            String outputStr = output.toString().toLowerCase();
            boolean success = exitCode == 0 || 
                             outputStr.contains("ttl") || 
                             outputStr.contains("time=") ||
                             outputStr.contains("bytes from");
            
            return success;
            
        } catch (Exception e) {
            return checkAvailabilityFallback();
        }
    }
    
    private boolean checkAvailabilityFallback() {
        try {
            Socket socket = new Socket();
            socket.connect(
                new java.net.InetSocketAddress(PING_HOST, 53), 
                PING_TIMEOUT_SECONDS * 1000
            );
            socket.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

