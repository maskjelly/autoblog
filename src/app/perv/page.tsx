"use client";

import { GoogleGenAI } from "@google/genai";
import { useState, FormEvent } from "react";

// Define the structure of a message
interface Message {
  role: string;
  parts: { text: string }[];
}

export default function ChatPage() {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to track loading

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true); // Set loading state to true

    const newMessage: Message = { role: "user", parts: [{ text: input }] };
    // Optimistically add the user message and a placeholder for the model's response
    setMessages([
      ...messages,
      newMessage,
      { role: "model", parts: [{ text: "" }] },
    ]);
    setInput("");

    try {
      const stream = await ai.models.generateContentStream({
        model: "gemini-1.5-flash",
        contents: [...messages, newMessage],
        config: {
          systemInstruction:
            "You talk in binary and binary only regardless of what is asked",
        },
      });

      // Update the last message (model's response) with the streamed text
      let streamedText = "";
      for await (const chunk of stream) {
        streamedText += chunk.text;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          // Find the last message (which is the model's placeholder)
          const lastMessageIndex = updatedMessages.length - 1;
          if (updatedMessages[lastMessageIndex].role === "model") {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              parts: [{ text: streamedText }],
            };
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update the last message with an error if something goes wrong
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        if (updatedMessages[lastMessageIndex].role === "model") {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            parts: [
              {
                text: "Apologies, I seem to have encountered an issue. Please try again later.",
              },
            ],
          };
        }
        return updatedMessages;
      });
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            {msg.parts.map((part, partIndex) => (
              <span
                key={partIndex}
                className={`inline-block p-2 rounded ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {"text" in part && part.text}
              </span>
            ))}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-l p-2"
            placeholder="Speak, good sir or madam..."
            disabled={isLoading} // Disable input while loading
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-r p-2"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
