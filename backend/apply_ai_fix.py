import os
import glob
import re

directory = '/Users/bharathkumar/Desktop/placementai-main/backend/src/main/java/com/aiplacement/backend/'
java_files = glob.glob(directory + '**/*.java', recursive=True)

import_to_add = "import java.time.Duration;\nimport reactor.util.retry.Retry;\nimport reactor.core.publisher.Mono;\n"

timeout_retry_block = """                            .timeout(Duration.ofSeconds(30))
                            .retryWhen(Retry.backoff(3, Duration.ofSeconds(2)))
                            .onErrorResume(e -> {
                                return Mono.just("{\\\"response\\\": \\\"AI service is currently unavailable. Please try again later.\\\"}");
                            })
                            .block();"""

timeout_retry_block_gemini = """                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2)))
                    .onErrorResume(e -> {
                        log.error("Ollama API failed: {}", e.getMessage());
                        return Mono.just("{\\\"response\\\": \\\"{\\\\\\\"atsScore\\\\\\\": 0, \\\\\\\"strengths\\\\\\\": [], \\\\\\\"weaknesses\\\\\\\": [], \\\\\\\"missingKeywords\\\\\\\": [], \\\\\\\"suggestions\\\\\\\": [\\\\\\\"AI service is currently unavailable. Please try again later.\\\\\\\"], \\\\\\\"bestRole\\\\\\\": \\\\\\\"Unknown\\\\\\\"}\\\"}");
                    })
                    .block();"""

for file_path in java_files:
    with open(file_path, 'r') as f:
        content = f.read()

    if '.bodyToMono(String.class)' in content and '.block();' in content:
        if 'Retry.backoff' in content:
            continue # already processed
        
        # Add imports
        if 'import java.time.Duration;' not in content:
            content = content.replace('import org.springframework.stereotype.Service;', 'import org.springframework.stereotype.Service;\n' + import_to_add)

        # Replace block
        if 'GeminiServiceImpl' in file_path:
            content = re.sub(r'\.bodyToMono\(String\.class\)\s*\.\s*block\(\);', '.bodyToMono(String.class)\n' + timeout_retry_block_gemini, content, flags=re.MULTILINE)
        else:
            content = re.sub(r'\.bodyToMono\(String\.class\)\s*\.\s*block\(\);', '.bodyToMono(String.class)\n' + timeout_retry_block, content, flags=re.MULTILINE)
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")

