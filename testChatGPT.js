import { OpenAI as OpenAIApi } from 'openai'
import readlineSync from "readline-sync";
import dotenv from 'dotenv'

let APIcall = async () => {
  dotenv.config()
  console.log(process.env)
  const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
  });

  const chatHistory = [];

  do {
    const user_input = readlineSync.question("Enter your input: ");
    const messageList = chatHistory.map(([input_text, completion_text]) => ({
      role: "user" === input_text ? "ChatGPT" : "user",
      content: input_text
    }));
    messageList.push({ role: "user", content: user_input });

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{"role": "user", "content": "Hello!"}],
      });
      console.log(chatCompletion.choices[0].message);

    } catch (err) {
      if (err.response) {
        console.log(err.response.status);
        console.log(err.response.data);
      } else {
        console.log(err.message);
      }
    }
  } while (readlineSync.question("\nYou Want more Results? (Y/N)").toUpperCase() === "Y");
};
APIcall();