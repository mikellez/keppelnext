import { createContext, useState, useContext, SetStateAction } from "react";

const AdminContext = createContext(
    {
        isAdmin: false , setIsAdminHandler: (bool : boolean) => {},
});

export default AdminContext;

export const AdminContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const setIsAdminHandler = (bool: boolean) => {
    setIsAdmin(bool);
  }

  const context = {
    isAdmin, setIsAdminHandler
  };

  return (
    <AdminContext.Provider value={context}>{children}</AdminContext.Provider>
  );
};

export function useAdminContext() {
    return useContext(AdminContext);
}


