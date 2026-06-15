import os
import glob
import re

directory = '/Users/bharathkumar/Desktop/placementai-main/backend/src/main/java/com/aiplacement/backend/'
java_files = glob.glob(directory + '**/*.java', recursive=True)

for file_path in java_files:
    with open(file_path, 'r') as f:
        content = f.read()

    if 'AI service is currently unavailable' in content and 'GeminiServiceImpl' not in file_path:
        # Fix the unescaped quotes in Mono.just for other services
        content = re.sub(
            r'return Mono\.just\("\{\\"response\\": \\"AI service is currently unavailable\. Please try again later\.\\"}"\);',
            r'return Mono.just("{\\"response\\": \\"AI service is currently unavailable. Please try again later.\\"}");',
            content
        )
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed {file_path}")
