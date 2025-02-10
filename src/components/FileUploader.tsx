import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import styled from "styled-components";
import { Trash2, Upload } from "lucide-react";

const Container = styled.div`
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #333;
  max-width: 400px;
  margin: 0 auto;
`;

const FileList = styled.ul`
  margin-bottom: 16px;
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  width: 100%;
  padding: 0;
`;

const FileItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 10px;
  width: 100%;
  transition: background 0.3s;
  text-align: left;
  a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 20px;
  }
  button {
    background-color: transparent;
    color: red;
    padding: 12px;
    border: none;
    outline: none;
  }
`;

const UploadArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px dashed #ffffff;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.3s;
  width: 100%;
  margin-bottom: 20px;
  &:hover {
    border-color: #00aaff;
  }
`;

const UploadButton = styled.button`
  width: 100%;
  background: #00aaff;
  color: white;
  padding: 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background 0.3s;
  &:hover {
    background: #0088cc;
  }
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; path: string }[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from("uploads").list();
    if (error) {
      console.error("Error fetching files:", error);
      return;
    }
    const files = data.map(file => ({
      name: file.name,
      path: file.name,
      url: supabase.storage.from("uploads").getPublicUrl(file.name).data.publicUrl,
    }));
    setUploadedFiles(files);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setUploading(true);
    
    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(filePath, file);
    
    if (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    } else {
      setUploadedFiles(prev => [
        ...prev,
        { name: file.name, path: filePath, url: supabase.storage.from("uploads").getPublicUrl(filePath).data.publicUrl },
      ]);
      alert("File uploaded successfully!");
    }
    setUploading(false);
  };

  const handleDelete = async (filePath: string) => {
    const { error } = await supabase.storage.from("uploads").remove([filePath]);
    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete file!");
    } else {
      setUploadedFiles(prev => prev.filter(file => file.path !== filePath));
      alert("File deleted successfully!");
    }
  };

  return (
    <Container>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>File Upload</h2>
      {uploadedFiles.length > 0 && (
        <FileList>
          {uploadedFiles.map((file, index) => (
            <FileItem key={index}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
              <button onClick={() => handleDelete(file.path)}>
                <Trash2 size={18} />
              </button>
            </FileItem>
          ))}
        </FileList>
      )}
      {file ? <p>Selected File: {file.name}</p> : (
        <UploadArea>
          <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="fileInput" />
          <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
            <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Upload size={20} /> Click to select a file
            </p>
          </label>
        </UploadArea>
      )}
      <UploadButton onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload File"}
      </UploadButton>
    </Container>
  );
};

export default FileUploader;
