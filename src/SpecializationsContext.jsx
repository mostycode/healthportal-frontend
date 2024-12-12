// Create the context
import {createContext, useContext, useEffect, useState} from "react";

const SpecializationsContext = createContext();

// Create a provider component
export const SpecializationsProvider = ({ children }) => {
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSpecializations = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/specializations");
                if (!response.ok) {
                    throw new Error(`Error fetching specializations: ${response.status}`);
                }
                const data = await response.json();
                setSpecializations(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSpecializations();
    }, []);

    return (
        <SpecializationsContext.Provider value={{ specializations, loading, error }}>
            {children}
        </SpecializationsContext.Provider>
    );
};

// custom hook for using SpecializationsContext
// this allows other components to directly call useSpecializations();
// instead of useContext(SpecializationsContext);
export const useSpecializations = () => {
    const context = useContext(SpecializationsContext);
    if (!context) {
        throw new Error("useSpecializations must be used within a SpecializationsProvider");
    }
    return context;
};