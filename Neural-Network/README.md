# 🧠 Neural Network Project with LLaMA Integration

Welcome to the **Neural Network** project! This project showcases a C++-based neural network that integrates **TinyLLaMA** through the [llama.cpp](https://github.com/ggerganov/llama.cpp) backend. This setup allows you to run LLaMA-based models locally from a clean executable, and it's all structured to be accessible and customizable.

---

## 📁 Project Structure

```
Neural-Network/
├── headers/
│   └── tinyllama.gguf            # Your downloaded TinyLLaMA model file
├── LLaMA/
│   └── llama.cpp/                # Submodule containing llama.cpp
├── src/
│   └── main.cpp                  # Entry point to your neural network logic
├── build/                        # Build directory
│   └── Release/NeuralNetwork.exe
├── CMakeLists.txt
└── README.md
```

---

## 🛠️ Setup Instructions

### ✅ Requirements

* CMake (version 3.16+ recommended)
* Visual Studio (for Windows build)
* C++ compiler

### 🔗 llama.dll Missing? Fix it like this!

If your program says `Unable to find llama.dll`, you’ll need to:

1. **Build the llama.cpp DLL**:

   * Navigate to `LLaMA/llama.cpp`
   * Run:

     ```bash
     mkdir build
     cd build
     cmake .. -DLLAMA_CURL=OFF
     cmake --build . --config Release
     ```
   * This will generate `llama.dll` inside `llama.cpp/build/bin/Release/`

2. **Add to Environment Variables**:

   * Add the path to `llama.dll` (e.g., `C:/Users/YourName/Documents/GitHub/Neural-Network/LLaMA/llama.cpp/build/bin/Release/`) to your system's `PATH`
   * Reboot or restart your terminal for changes to apply

> 💡 `-DLLAMA_CURL=OFF` is essential—it prevents extra dependencies like `curl`, `llava`, or server modules from being included.

---
<h3> Install Python-dev tools</h3>

> For searching and voice input & output module to work it needs to install Python.h header files which is installed with dev tools.

---

## 🧱 Building the Project

From the root of the repository, run:

```bash
mkdir build
cd build
cmake .. -DLLAMA_CURL=OFF
cmake --build . --config Release
```

> This will generate `NeuralNetwork.exe` in `build/Release/`

---

## 🚀 Running the Executable

Once built, you can run the app using:

```bash
./Release/NeuralNetwork.exe
```

If everything is set up properly, you should see detailed model loading output ending in:

```
✅ Model loaded successfully!
Model freed. Exiting program.
```

---

## 🧪 Model File

Make sure you've placed your `.gguf` model (like `tinyllama.gguf`) inside the `headers/` directory. You can download TinyLLaMA from [Hugging Face](https://huggingface.co/cognitivecomputations/TinyLlama-1.1B-Chat).

---

## 🧠 Output Explanation

During execution, the program prints:

* Model metadata (architecture, tokens, size, etc.)
* Tokenizer setup status
* Tensor allocation logs
* CPU memory mapping and layer assignment

This is all expected—it's showing you how the LLaMA model is being loaded and prepped for inference.

---

## 💡 Pro Tips

* Use `-DLLAMA_CURL=OFF` unless you need `llava` or `server` support.
* Always check that `llama.dll` is in your `PATH`.
* Make sure `tinyllama.gguf` exists and is readable by the executable.

---

## 🙌 Credits

* [`llama.cpp`](https://github.com/ggerganov/llama.cpp) by Georgi Gerganov
* TinyLLaMA 1.1B model from [Cognitive Computations](https://huggingface.co/cognitivecomputations/TinyLlama-1.1B-Chat)

---

Now you're all set! Happy experimenting 🤖✨
