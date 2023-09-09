const e = require('express');
const express = require('express');
require('dotenv').config();
const OpenAI = require("openai");

const app = express();

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

//Arrow function to input secret key in the request body
const input_openai_key = (secretKey) => {
  const openai = new OpenAI({
    apiKey: secretKey,
  });
  return openai;
}


// API that takes in only the prompt at the request body
app.post("/api/v1/chat/completion/ask", async (req, res) => {
  // getting prompt from request body
  const prompt = req.body.prompt;
  try {
  //throw an error if prompt is not provided
    if (prompt == null) {
      res.status(400).json({
          success: false,
          message: "Prompt is required",
      });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."},
        {"role": "user", "content": prompt}
      ],
      temperature: 1,
      max_tokens: 60,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
    });
    const completion = response.choices[0].message;
    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response
      ? error.response.data
      : { message: "Internal server error" },
    });
    }
});


// API that takes in only the prompt at the request body(using model 'text-davinci-003')
app.post("/api/v1/completion/ask", async (req, res) => {
  // getting prompt from request body
  const prompt = req.body.prompt;
  try {
  //throw an error if prompt is not provided
    if (prompt == null) {
      res.status(400).json({
          success: false,
          message: "Prompt is required",
      });
    }
    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: prompt,
    });
    const completion = JSON.parse(response.choices[0].text);
    // const completion_parsed = JSON.stringify(completion)
    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.response
      ? error.response.data
      : { message: "Internal server error" },
    });
    }
});




// A sentimental analysis API
const sentiment_analysis_prompt = "Please classify the sentiment expressed in the following sentence as positive or negative and neutral if it does not convey a clear statement or it appears to be a random sequence of letters and does not express any sentiment, if that is the case just reply with one word 'neutral'."; 
app.post("/api/v1/chat/completion/sentiment", async (req, res) => {
  // getting prompt from request body
  const prompt = req.body.prompt;
  try {
  // throw an error if prompt is not provided
    if (prompt == null) {
      res.status(400).json({
          success: false,
          message: "Prompt is required",
      });
    }
  // Call the OpenAI API to analyze the sentiment of the text
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": sentiment_analysis_prompt}, 
        {"role": "user", "content": prompt}
      ],
    })
    const completion = response.choices[0].message.content;
    return res.status(200).json({
      success: true,
      message: completion,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response
      ? error.response.data
      : { message: "Internal server error" },
    });
  }
})



// API that takes in the prompt and also the secret key at the request body
app.post("/api/v1/completion/chatbot", async (req, res) => {
  // getting prompt question from request
  const prompt = req.body.prompt;
  const secretKey = req.body.secretKey;
  try {
    if (prompt == null) {
      res.status(400).json({
          success: false,
          message: "Prompt is required",
      });
    }
    // call the secret key request body function
    const openai = input_openai_key(secretKey);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "system", "content": "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly."},
        {"role": "user", "content": prompt}
      ],
      temperature: 1,
      max_tokens: 60,
      frequency_penalty: 0.2,
      presence_penalty: 0.2,
  
    });
    const completion = response.choices[0].message;
    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    if (error.code === "invalid_api_key") {
      return res.status(400).json({
        success: false,
        message: "Invalid Openai secretKey",
      });  
    }
    else{
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
});


const port = process.env.PORT;

app.listen(port, () => console.log(`Listening on port ${port}`));