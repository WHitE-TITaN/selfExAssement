#include "llama.h"
#include "..\headers\model.h"
#include <iostream>
#include <string>
#include <vector>
#include <cstring>  


int main() {
 
    assistant myAssistant;
    
    // Read entire input from stdin (for Node.js backend)
    std::string inputText;
    std::string line;
    
    // Read all lines from stdin
    while (std::getline(std::cin, line)) {
        inputText += line + "\n";
    }
    
    // Set the prompt with the input text
    myAssistant.setPrompt(inputText);
    
    // Generate output
    myAssistant.generateOutput();    
    
    return 0;
}