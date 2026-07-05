import { useState } from "react";
import { uploadPdf } from "../services/upload.service";
import { toast } from "react-hot-toast";

interface UploadFormProps {
    onUploadSuccess: (fileName: string) => void;
}

export default function UploadForm({
    onUploadSuccess,
}: UploadFormProps) {

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    async function handleUpload() {

        if (!file) {
            toast("Please select a PDF");
            return;
        }

        try {

            setLoading(true);

            const result = await uploadPdf(file);
            console.log(result);

            toast.success("PDF Uploaded Successfully");
            onUploadSuccess(file.name);
            setFile(null);

        } catch (error) {
            console.error(error);

            toast.error("Upload Failed");

        } finally {
            setLoading(false);
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setIsDragOver(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragOver(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === "application/pdf") {
            setFile(droppedFile);
        } else {
            toast.error("Only PDF files are allowed");
        }
    }

    return (
        <div className="card">

            <h2>Upload PDF</h2>

            <input
                type="file"
                accept=".pdf"
                id="file-input"
                onChange={(e) => {
                    if (e.target.files?.length) {
                        setFile(e.target.files[0]);
                    }
                }}
            />

            <div
                className={`file-upload-area ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <div className="icon">📄</div>
                <p>{file ? file.name : "Drag & drop a PDF here or click to browse"}</p>
                {file && <p className="file-name">{file.name}</p>}
            </div>

            <button
                onClick={handleUpload}
                disabled={loading || !file}
            >
                {loading ? <><span className="loading-spinner"></span>Uploading...</> : "Upload PDF"}
            </button>

        </div>
    );

}