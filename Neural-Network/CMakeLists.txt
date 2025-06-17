cmake_minimum_required(VERSION 3.10)

#PROJECT NAME
project(Neural-Network)

#C++ standards
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED true)


#Add Executables
add_executable(NeuralNetwork
    src/main.cpp
)


target_include_directories(NeuralNetwork PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp     # llama.h is here
    ${CMAKE_CURRENT_SOURCE_DIR}/llama.cpp/include  
)

include_directories(headers)

add_subdirectory(llama.cpp)

target_link_libraries(NeuralNetwork PRIVATE llama)

