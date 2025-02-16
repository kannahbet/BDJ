import React,{ useState, useEffect}from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

import axios from 'axios';
import GroupList from '../../components/Tables/listegroupe';

interface Group {
  name: string;
  id?: number;
}


const SignIn: React.FC = () => {
  const [groupName, setGroupName] = useState('');
  const [grouper, setGrouper] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "">("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  });
   // Chargement des groupes depuis l'API
   useEffect(() => {
    fetch("http://localhost:5000/api/groups")
      .then((res) => res.json())
      .then((data) => setGrouper(data))
      .catch((err) => console.error("Erreur de chargement des groupes", err));
  }, []);

  const handleSubmitGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGroup: Group = { name: groupName };
      await axios.post('http://localhost:5000/api/groups', newGroup);
      alert('Groupe créé avec succès !');
      setGroupName('');
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
  };


 
 const handleSubmitUser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (selectedGroup === "") {
    alert("Veuillez sélectionner un groupe");
    return;
  }

  const newUser = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    isAdmin: formData.isAdmin,
    groupId: selectedGroup,
  };




  try {
    const response = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (response.ok) {
      alert("Utilisateur ajouté avec succès !");
      setFormData({ username: "", email: "", password: "", isAdmin: false });
      setSelectedGroup("");
    } else {
      alert("Erreur lors de l'ajout de l'utilisateur.");
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des données", error);
  }
};
 

  return (
   
    <>
 
      <Breadcrumb pageName="Sign In" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
            

              <p className="2xl:px-20">
              Liste de tous les groupes de travail de l'entreprise
              </p>
              <form onSubmit={handleSubmitGroup}>
      <input className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white"
        type="text"
        value={groupName}
        onChange={handleChange} // Utilisation de handleChange
        placeholder="Nom du groupe"
        required
      />
      <button type="submit" className="w-full cursor-pointer rounded-lg border bg-primary p-1 text-white transition hover:bg-opacity-90">Créer le groupe</button>
      <br /> <br />
    </form>
    <GroupList />
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
      <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
        <h2 className="mb-1 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
          Ajouter un nouvel utilisateur
        </h2>

        <form onSubmit={handleSubmitUser}>
          <div className="mb-4">
            {/* Username */}
            <label className="mb-3 block text-black dark:text-white">Nom d'utilisateur</label>
            <input type="text" name="username" value={formData.username}onChange={(e) => setFormData({ ...formData, username: e.target.value })} required className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" />

            {/* Password */}
            <label className="mb-3 block text-black dark:text-white">Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" />

            {/* Email */}
            <label className="mb-3 block text-black dark:text-white">Email</label>
            <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full rounded-lg border bg-transparent py-3 px-5 text-black dark:text-white" />

            {/* User Group */}
            <label className="mb-3 block text-black dark:text-white">Groupe d'utilisateur</label>
  
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(Number(e.target.value))}
              required
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
               <option value="">Sélectionner un groupe</option>
          {grouper.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
              ))}
            </select>

            {/* Is Admin */}
            <label className="mb-2.5 block font-medium text-black dark:text-white">
              Administrateur
            </label>
            <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })} className="mr-2" />
            <span className="text-black dark:text-white">Oui</span>
          </div>

          {/* Submit Button */}
          <div className="mb-5">
            <input type="submit" value="Insérer un nouvel utilisateur" className="w-full cursor-pointer rounded-lg border bg-primary p-4 text-white transition hover:bg-opacity-90" />
          </div>
        </form>
      </div>
    </div>

        </div>
      </div>
    </>
  );
};

export default SignIn;
