import { useState, useEffect } from "react";
import axios from "axios";

interface Book {
    id: number;
    name: string;
    author: string;
    description: string;
}

export default function BookManager() {
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetch("http://localhost:5000/api/listbooks")
            .then(res => res.json())
            .then((data: Book[]) => setBooks(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedBook) {
            fetch(`http://localhost:5000/api/books/${selectedBook}/tags`)
                .then(res => res.json())
                .then((data: string[]) => setTags(Array.isArray(data) ? data : []))
                .catch(console.error);
        } else {
            setTags([]);
        }
    }, [selectedBook]);

    const addTag = async () => {
        if (!newTag.trim() || !selectedBook) return;

        const response = await fetch(`http://localhost:5000/api/books/${selectedBook}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tag: newTag }),
        });

        if (response.ok) {
            setTags(prevTags => [...prevTags, newTag]);
            setNewTag("");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("author", author);
        formData.append("description", description);
        if (file) {
            formData.append("file", file);
        }

        try {
            await axios.post("http://localhost:5000/api/upload-book", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Livre ajouté avec succès!");
            setName("");
            setAuthor("");
            setDescription("");
            setFile(null);
        } catch (error) {
            console.error("Erreur lors de l'upload du livre:", error);
        }
    };

    const handleDeleteBook = (id: number) => {
      if (window.confirm(`Voulez-vous vraiment supprimer cet Document ${id}?`)) {
        fetch(`http://localhost:5000/api/book/${id}`, { method: "DELETE" })
          .then((response) => response.json())
          .then((data) => {
            alert(data.message);
            setBooks(books.filter((books) => books.id !== id));
          })
  
          .catch((error) => console.error("Erreur lors de la suppression:", error));
      }
    };
    return (
        <div style={{ display: "flex", gap: "5px", padding: "5px" }}>
            {/* Liste des livres */}
            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
      <h2 className="text-xl font-semibold text-black dark:text-white">
        Base de donné de documents juridiques
        </h2>
        <table className="w-full table-auto">
       
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] py-4 px-3 font-medium text-black dark:text-white xl:pl-11">name</th>
              <th className="min-w-[150px] py-4 px-3 font-medium text-black dark:text-white">Author</th>
              <th className="min-w-[250px] py-4 px-3 font-medium text-black dark:text-white">Description</th>
              <th className="min-w-[50px] py-4 px-3 font-medium text-black dark:text-white">Actions</th>
  
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">{book.name}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{book.author}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{book.description}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button className="hover:text-primary" onClick={() => handleDeleteBook(book.id)}>
                      <svg
                        className="fill-current text-red-600 hover:text-red-800"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.67815 7.98164 1.37502 8.30039 1.37502H9.68414C10.0029 1.37502 10.306 1.67815 10.306 1.9969V2.47502H7.67852V1.9969ZM12.6004 15.3375C12.5729 15.8938 12.1154 16.3469 11.5591 16.3469H6.10352C5.54727 16.3469 5.08977 15.8938 5.06227 15.3375L4.61977 6.30315H13.0423L12.6004 15.3375Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
            {/* Gestion des livres et tags */}
            
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
        Ajouter un livre
        </h4>
   
      <div className="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"></div>
            <div style={{ flex: 2 }}>
                <h3></h3>
                <form onSubmit={handleSubmit}>
                <div className="mb-4">
                <label className="mb-3 block text-black dark:text-white">Nom du document</label>
                    <input type="text" className="w-full rounded-lg border bg-transparent py-2 px-3 text-black dark:text-white" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du livre" required />
                    <label className="mb-3 block text-black dark:text-white">Nom de l'Auteur</label>
                    <input type="text" className="w-full rounded-lg border bg-transparent py-2 px-3 text-black dark:text-white" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Auteur" required />
                    <label className="mb-3 block text-black dark:text-white">Description du livre</label>
                    <textarea className="w-full rounded-lg border bg-transparent p2-3 px-3 text-black dark:text-white" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
                    <input className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" type="file" onChange={handleFileChange} required />
                    <button type="submit">Ajouter</button>
                </div>
                </form>
                
                <h3>Gestion des tags</h3>
                <select onChange={(e) => setSelectedBook(e.target.value)} defaultValue="">
                    <option className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" value="" disabled>Choisissez un livre</option>
                    {books.map(book => (
                        <option key={book.id} value={book.id}>{book.name}</option>
                    ))}
                </select>
                {selectedBook && (
                    <div>
                        <h4>Tags du livre sélectionné</h4>
                        <ul>
                            {tags.map((tag, index) => (
                                <li key={index}>{tag}</li>
                            ))}
                        </ul>
                        <input className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Ajouter un tag..." />
                        <button onClick={addTag}>Ajouter</button>
                    </div>
                )}
            </div>
        </div>
        </div> 
    );
}
