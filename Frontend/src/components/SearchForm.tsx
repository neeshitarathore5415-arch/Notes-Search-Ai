import { useState, useRef } from "react";
import { searchNotes } from "../services/search.service";
import AnswerCard from "./AnswerCard";
import { toast } from "react-hot-toast";

interface SearchFormProps {
    disabled: boolean;
}

interface Source {
    documentId: string;
    chunkIndex: number;
    fileName: string;
}


interface Message {
    role: "user" | "assistant";
    text: string;
    sources?: Source[];
}

export default function SearchForm({
    disabled,
}: SearchFormProps) {

    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const answerRef = useRef<HTMLDivElement>(null);

    async function handleSearch() {

        if (!query.trim()) return;

        try {

            setLoading(true);

            const result = await searchNotes(query);

            const aiAnswer = result.answer.message.content[0].text;
            console.log("Answer:", result.answer);
            console.log("Text:", result.answer.message.content[0].text);
            console.log("Type:", typeof result.answer.message.content[0].text);

            const sources = result.results.map((item: any) => ({
                documentId: item.payload.documentId,
                chunkIndex: item.payload.chunkIndex,
                fileName: item.payload.fileName || "Document.pdf",
            }));

            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    text: query,
                },
                {
                    role: "assistant",
                    text: aiAnswer,
                    sources,
                },
            ]);

            setQuery("");

            setTimeout(() => {

                inputRef.current?.focus();

                if (answerRef.current) {
                    answerRef.current.scrollTop =
                        answerRef.current.scrollHeight;
                }

            }, 100);

        } catch (error) {

            console.error(error);
            toast.error("Something went wrong while searching.");

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="card">

            <h2>Ask Questions</h2>

            {messages.length > 0 && (

                <div
                    className="chat-history"
                    ref={answerRef}
                >

                    {messages.map((message, index) => (

                        <AnswerCard
                            key={index}
                            answer={message.text}
                            role={message.role}
                            sources={message.sources}
                        />

                    ))}

                </div>

            )}

            <input
                ref={inputRef}
                type="text"
                placeholder={
                    disabled
                        ? "Upload a PDF first..."
                        : "Ask anything from your notes..."
                }
                value={query}
                disabled={disabled}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !disabled) {
                        handleSearch();
                    }
                }}
            />

            {disabled && (

                <p className="search-disabled">
                    📄 Upload a PDF to start asking questions.
                </p>

            )}

            <button
                onClick={handleSearch}
                disabled={
                    disabled ||
                    loading ||
                    !query.trim()
                }
            >
                {
                    loading
                        ? (
                            <>
                                <span className="loading-spinner"></span>
                                Searching...
                            </>
                        )
                        : "Ask"
                }
            </button>

        </div>

    );
}