import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

type Props = {
    answer: string;
    role: "user" | "assistant";
    sources?: {
        documentId: string;
        chunkIndex: number
    }[];
};

export default function AnswerCard({
    answer,
    role,
    sources,
}: Props) {

    if (!answer) return null;

    async function copyAnswer() {
        await navigator.clipboard.writeText(answer);
        toast.success("Copied!");
    }

    return (

        <div className={role === "user" ? "user-message" : "answer"}>

            <div className="answer-header">

                <h2>
                    {role === "user" ? "👤 You" : "🤖 AI Answer"}
                </h2>

                {
                    role === "assistant" && (
                        <button
                            className="copy-btn"
                            onClick={copyAnswer}
                        >
                            📋 Copy
                        </button>
                    )
                }

            </div>

            <div className="answer-content">
                <ReactMarkdown>
                    {answer}
                </ReactMarkdown>
                <button onClick={copyAnswer} className="copy-button">
                    Copy
                </button>
            </div>
            {
                role === "assistant" &&
                sources &&
                sources.length > 0 && (

                    <div className="sources">

                        <h4>📚 Sources</h4>

                        {
                            sources.map((source, index) => (

                                <div
                                    key={index}
                                    className="source-item"
                                >
                                    📄 Chunk #{source.chunkIndex}
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
}