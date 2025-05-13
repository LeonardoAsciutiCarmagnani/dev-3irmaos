import { ImageIcon, ImageOffIcon, InfoIcon, XCircleIcon } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";

interface ImageUploaderProps {
  onFileSelect?: (files: File[]) => void;
  maxSizeInBytes?: number;
  acceptedFileTypes?: string[];
  children?: React.ReactNode;
  isUploading?: boolean;
  uploadError?: string | null;
}

const Dropzone: React.FC<ImageUploaderProps> = ({
  isUploading = false,
  uploadError = null,
  onFileSelect,
  maxSizeInBytes = 8 * 1024 * 1024, // 8MB
  acceptedFileTypes = ["image/jpeg", "image/png", "video/mp4"],
}) => {
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Converte o array de MIME types para o formato esperado pelo react-dropzone
  const acceptFormats: Accept = acceptedFileTypes.reduce((acc, type) => {
    if (type.startsWith("image/") || type.startsWith("video/")) acc[type] = [];
    return acc;
  }, {} as Accept);

  const handleFileSelect = useCallback(
    (newFiles: File[] | null) => {
      if (onFileSelect) {
        onFileSelect(newFiles || []);
      }
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Verifica rejeições e exibe mensagem de erro
      if (fileRejections.length > 0) {
        setError(fileRejections[0].errors[0].message);
        return;
      }

      // Verifica quantas imagens já foram selecionadas
      const availableSlots = 5 - files.length;
      if (availableSlots <= 0) {
        setError("Você já selecionou o máximo de 5 imagens.");
        return;
      }

      // Limita a quantidade de arquivos adicionados
      const filesToAdd = acceptedFiles.slice(0, availableSlots);

      // Cria previews para cada novo arquivo
      const newPreviews = filesToAdd.map((file) => {
        const url = URL.createObjectURL(file);
        return {
          url,
          type: file.type.startsWith("video/") ? "video" : "image",
        };
      });

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...filesToAdd];
        handleFileSelect(updatedFiles);
        return updatedFiles;
      });
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
      setError(null);
    },
    [files, handleFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: acceptFormats,
    maxSize: maxSizeInBytes,
  });

  const removeImage = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    handleFileSelect(newFiles);
  };

  return (
    <div className="space-y-4  flex  items-start">
      <div className="flex flex-col  gap-6 items-start">
        {/* Área do Dropzone */}
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-xs p-6 flex flex-col items-center justify-center w-52 h-52 hover:border-red-400 transition-colors cursor-pointer"
          aria-disabled={isUploading}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-lg text-red-400">Solte as imagens aqui...</p>
          ) : (
            <>
              {!error ? (
                <ImageIcon size={48} color="gray" />
              ) : (
                <ImageOffIcon size={48} color="red" />
              )}
              <p className="text-sm text-gray-500 text-center mt-4">
                Clique ou arraste para selecionar até 5 imagens
              </p>
            </>
          )}
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {uploadError && (
          <p className="text-red-400 text-sm text-center">{uploadError}</p>
        )}

        <div className="flex items-center gap-2 ">
          <InfoIcon size={18} className="text-red-500" />
          <div className="text-gray-600 text-xs">
            <p>Formatos aceitos: JPEG, PNG, MP4.</p>
            <p>Tamanho máximo: 5MB. Máximo de 5 imagens.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative w-32 h-32 rounded-xs overflow-hidden shadow-lg"
          >
            {preview.type === "image" ? (
              <img
                src={preview.url}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={preview.url}
                controls
                className="w-full h-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
            >
              <XCircleIcon
                size={16}
                color="white"
                className="hover:cursor-pointer"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dropzone;
