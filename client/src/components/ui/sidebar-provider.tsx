import * as React from "react";

type SidebarContextValue = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
};

export const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}