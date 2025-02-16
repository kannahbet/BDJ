import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  group_id: number;
}

const TableThree = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Erreur lors de la récupération des utilisateurs:", error));
  }, []);


  const handleDeleteUser = (id: number) => {
    if (window.confirm(`Voulez-vous vraiment supprimer cet utilisateur ${id}?`)) {
      fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          setUsers(users.filter((user) => user.id !== id));
        })

        .catch((error) => console.error("Erreur lors de la suppression:", error));
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">Username</th>
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Group ID</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">{user.username}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{user.email}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{user.group_id}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button className="hover:text-primary" onClick={() => handleDeleteUser(user.id)}>
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
  );
};

export default TableThree;
