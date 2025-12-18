package com.ares.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/datasource")
@CrossOrigin(origins = "http://localhost:4200")
public class DatasourceController {

    private static final String PING_HOST = "8.8.8.8";
    private static final int PING_TIMEOUT_SECONDS = 3;
    private static final int PING_COUNT = 1;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Boolean>> ping() {
        Map<String, Boolean> response = new HashMap<>();
        boolean isAvailable = checkAvailability();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    private boolean checkAvailability() {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            ProcessBuilder processBuilder;
            
            if (os.contains("win")) {
                // Windows ping command
                processBuilder = new ProcessBuilder(
                    "ping", "-n", String.valueOf(PING_COUNT), "-w", String.valueOf(PING_TIMEOUT_SECONDS * 1000), PING_HOST
                );
            } else {
                // Unix/Linux/Mac ping command
                processBuilder = new ProcessBuilder(
                    "ping", "-c", String.valueOf(PING_COUNT), "-W", String.valueOf(PING_TIMEOUT_SECONDS), PING_HOST
                );
            }
            
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            // Read the output
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            // Wait for the process to complete
            int exitCode = process.waitFor();
            
            // Check if ping was successful
            // Exit code 0 means success on both Windows and Unix
            // Also check the output for success indicators
            String outputStr = output.toString().toLowerCase();
            boolean success = exitCode == 0 || 
                             outputStr.contains("ttl") || 
                             outputStr.contains("time=") ||
                             outputStr.contains("bytes from");
            
            return success;
            
        } catch (Exception e) {
            // If ping command fails, try fallback method using socket connection
            return checkAvailabilityFallback();
        }
    }
    
    private boolean checkAvailabilityFallback() {
        try {
            java.net.Socket socket = new java.net.Socket();
            socket.connect(new java.net.InetSocketAddress(PING_HOST, 53), PING_TIMEOUT_SECONDS * 1000);
            socket.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

