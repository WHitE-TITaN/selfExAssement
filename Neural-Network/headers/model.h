#include "llama.h"
#include <iostream>
#include <string>
#include <vector>
#include <cstring>  

/*llama_load_model_from_file() 
    → llama_new_context_with_model()
        → llama_tokenize()
            → llama_eval()
                → llama_sample_token()
                    → llama_token_to_str()
→ loop for more tokens →
→ llama_free() & llama_free_model()
*/


class assistant{
    //store model
    llama_model_params model_params;
    llama_model* model;

    //load vocabulay from gguf file.
    const llama_vocab* vocab;

    //store model context
    llama_context_params ctx_params;
    llama_context* ctx ;

    //input to model
    std::string prompt;
    std::vector<llama_token> prompt_tokens;

    public:

        assistant(){
            llama_backend_init();
            
            //loading model in
            model_params = llama_model_default_params();
            model = llama_model_load_from_file("C:/Users/dk488/Downloads/llama-2-7b-chat.Q8_0.gguf", model_params);
            if (!model) {
                std::cerr << "❌ Failed to load model\n";
                return;
            }

            //creating context..
            ctx_params = llama_context_default_params();
            ctx_params.n_ctx = 2048;
            ctx = llama_init_from_model(model, ctx_params);

            vocab = llama_model_get_vocab(model);
        }


        void promptInput(){
            
            prompt = "user: " + prompt + "\nAssistant: ";
            prompt_tokens.resize(prompt.size() + 16);
        }

        // New method to set prompt from external input
        void setPrompt(const std::string& inputText) {
            prompt = "User: Please summarize the following document into 5-8 informative cards, each 2-4 sentences. \n\n" + inputText + "\n\nAssistant: ";
            prompt_tokens.resize(prompt.size() + 16);
        }


        std::vector<std::string> generateOutput(){
            std::vector<std::string> result;
            std::string generatedText;
            
            int n_tokens = llama_tokenize(
                vocab,
                prompt.c_str(),
                (int32_t)prompt.length(),
                prompt_tokens.data(),
                prompt_tokens.size(),
                true,  // add_special (BOS)
                false  // parse_special
            );

            prompt_tokens.resize(n_tokens);

            // Run prompt through llama
            llama_batch batch = llama_batch_get_one(prompt_tokens.data(), n_tokens);
            llama_decode(ctx, batch);

            // Set up sampling
            llama_sampler_chain_params sparams = llama_sampler_chain_default_params();
            llama_sampler* sampler = llama_sampler_chain_init(sparams);
            llama_sampler_chain_add(sampler, llama_sampler_init_temp(0.8f));
            llama_sampler_chain_add(sampler, llama_sampler_init_top_p(0.95f, 1));
            llama_sampler_chain_add(sampler, llama_sampler_init_top_k(40));
            llama_sampler_chain_add(sampler, llama_sampler_init_dist(LLAMA_DEFAULT_SEED));

            std::cout << prompt;

            llama_token token;
            for (int i = 0; i < 512; ++i) {
                token = llama_sampler_sample(sampler, ctx, -1);

                // Break on EOS
                if (llama_vocab_is_eog(vocab, token)) break;

                // Decode token to string
                char piece[128];
                int n = llama_token_to_piece(vocab, token, piece, sizeof(piece), 0, true);

                if (n > 0) {
                    piece[n] = '\0'; // ensure null-termination
                    std::string tokenStr(piece);
                    generatedText += tokenStr;
                    std::cout << piece << std::flush;
                } else {
                    std::cerr << "[WARN] Failed to decode token: " << token << "\n";
                }

                // Feed token back to model
                llama_batch new_batch = llama_batch_get_one(&token, 1);
                llama_decode(ctx, new_batch);
            }

            llama_sampler_free(sampler);
            result.push_back(generatedText);
            return result;
        }

        ~assistant(){
            llama_free(ctx);
            llama_model_free(model);
            llama_backend_free();
        }
};

