import { createContext, useState } from "react";

const StaffContext = createContext({
  staff: { first: null, second: null } as {
    first: null | number;
    second: null | number;
  },
  setFirstStaffHandler: (id: number) => {},
  setSecondStaffHandler: (id: number) => {},
});

export default StaffContext;

export const StaffContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [staff, setStaff] = useState<{
    first: null | number;
    second: null | number;
  }>({ first: null, second: null });

  const setFirstStaffHandler = (id: number) => {
    setStaff((prevState) => {
      return { ...prevState, first: id };
    });
  };

  const setSecondStaffHandler = (id: number) => {
    setStaff((prevState) => {
      return { ...prevState, second: id };
    });
  };

  const context = {
    staff,
    setFirstStaffHandler,
    setSecondStaffHandler,
  };

  return (
    <StaffContext.Provider value={context}>{children}</StaffContext.Provider>
  );
};
