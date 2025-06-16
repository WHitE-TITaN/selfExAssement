# 🧠 SelfEx Assessment with LLaMA Integration

Welcome to the **Neural Network** project! This project showcases a C++-based neural network that integrates **TinyLLaMA** through the [llama.cpp](https://github.com/ggerganov/llama.cpp) backend. This setup allows you to run LLaMA-based models locally from a clean executable, and it's all structured to be accessible and customizable.

## 🔗 Setup and llama.dll Missing? Fix it like this!

### ⚒️ Setup
 * settingup backend and making dll and executables LLM

---
```bash
#cloning main backed code of llama
mkdir Neural-Network
cd Neural-Network
git clone https://github.com/WHitE-TITaN/Neural-Network.git


#edit cmake inside the cloned Neural-Network

#change add_subdirectory(LLaMA/llama.cpp) 
# to add_subdirectory(llama.cpp)
mkdir build
cd build

#building backend..
cmake ..
#if facing any issues while creating cache use this insted of cmake .. then use --build command.
cmake .. -DLLAMA_CURL=OFF
cmake --build . --config Release
```

---
### ⛓️‍💥fixing llama.dll Missing ?
If your program says `Unable to find llama.dll`, you’ll need to:

1. **Build the llama.cpp DLL**:

     ```bash
     #build the Neural-Network backend and check for llama.cpp/build/bin/Release/llama.dll 
     cmake .. -DLLAMA_CURL=OFF
     cmake --build . --config Release
     ```
   * This will generate `llama.dll` inside `llama.cpp/build/bin/Release/`
   * add the path to System Enviroment variables
