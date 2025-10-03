import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function UploadStatement() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    setFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select or drop a PDF file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:8000/upload-statement",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setLoading(false);
      toast.success(`Uploaded successfully: ${response.data.filename}`);
      console.log("OCR Output:", response.data.output);
      setFile(null);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 w-[320px] h-[260px] flex flex-col justify-between">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 text-center">
        📑 Upload Statement
      </h2>

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-purple-400 rounded-lg p-4 text-center cursor-pointer hover:bg-purple-50 transition text-sm"
        onClick={() => document.getElementById("fileInput").click()}
      >
        {file ? (
          <p className="text-gray-700">📄 {file.name}</p>
        ) : (
          <p className="text-gray-500">Drag & drop a PDF or click</p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 w-full py-2 bg-gradient-to-r from-[#7209b7] to-[#9d4edd] text-white text-sm font-medium rounded-lg shadow hover:scale-[1.02] transition"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default UploadStatement;
