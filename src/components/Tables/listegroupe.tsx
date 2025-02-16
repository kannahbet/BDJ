import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Group {
  id: number; // Assurez-vous d'inclure l'ID du groupe
  name: string;
  // ... autres propriétés de votre groupe
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/groups'); // Remplacez par votre URL
        setGroups(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des groupes:", err);

        if (axios.isAxiosError(err)) {
          setError(err.response?.data.message || "Erreur lors de la récupération des groupes.");
        } else {
          setError("Erreur inattendue.");
        }

      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []); // Le tableau vide signifie que cela s'exécute une seule fois au montage du composant

  if (loading) {
    return <div>Chargement des groupes...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Liste des groupes
      </h4>
      <div className="flex flex-col">
          <div className="grid grid-cols-1 rounded-sm bg-gray-2 dark:bg-meta-4"> {/* Ajuster les colonnes selon vos besoins */}
            <div className="p-2.5 xl:p-5">
              <h5 className="text-sm font-medium uppercase">Nom du groupe</h5> {/* En-tête */}
            </div>
          </div>
        {groups.map((group) => (
          <div
            className="grid grid-cols-1 border-b border-stroke dark:border-strokedark" // Ajuster les colonnes
            key={group.id} // Important : utilisez un identifiant unique (comme l'ID)
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{group.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;