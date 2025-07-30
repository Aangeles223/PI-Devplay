import { createContext } from "react";

export const UserContext = createContext({
  usuario: null,
  setUsuario: () => {},
});
