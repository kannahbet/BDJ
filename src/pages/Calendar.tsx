import React, { useEffect, useState } from 'react';

interface Book {
  id: number;
  name: string;
  author: string;
  description: string;
  file_path: string;
}


const PdfViewer: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<Book[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/listbooks')
      .then((response) => response.json())
      .then((data: Book[]) => setPdfFiles(data))
      .catch((error) => console.error('Erreur lors de la récupération des fichiers PDF:', error));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
      {pdfFiles.map((pdf, index) => (
        <div key={index} className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-title-md font-bold text-black dark:text-white mb-2">{pdf.name}</h4>
          <iframe 
            src={`http://localhost:5000/${pdf.file_path}`}
            className="w-full h-40 rounded-md border border-gray-300" 
            title={pdf.name}
          ></iframe>
          <div className="mt-2 text-center">
            <a 
              href={`http://localhost:5000/${pdf.file_path}`}
              download 
              className="text-blue-500 hover:underline"
            >
              Télécharger
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PdfViewer;
