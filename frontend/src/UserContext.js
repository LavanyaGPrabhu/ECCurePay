import React, { createContext, useState } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    );
};
