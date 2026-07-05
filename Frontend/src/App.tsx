import { useState } from "react";
import UploadForm from "./components/UploadForm";
import SearchForm from "./components/SearchForm";
import "./index.css";
import { Toaster } from "react-hot-toast";

function App() {

  const [uploaded, setUploaded] = useState(false);
  const [documentName, setDocumentName] = useState("");

  return (

    <div className="container">
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <div className="hero">

        <h1>📚 Notes Search Assistant</h1>

        <p>
          Upload your PDF and ask questions using AI powered semantic search.
        </p>

      </div>

      <UploadForm
        onUploadSuccess={(name) => {
          setUploaded(true);
          setDocumentName(name);
        }}
      />

      {
        uploaded && (
          <div className="success-card">
            <h3>✅ Document Ready</h3>
            <p>{documentName}</p>

            <span>
              Your notes have been indexed successfully.
            </span>
          </div>
        )
      }

      <SearchForm
        disabled={!uploaded}
      />

    </div>

  );
}

export default App;