import {useEffect, useState} from "react";
import DoctorsTable from "./DoctorsTable.jsx";

function Admin() {
    const [doctors, setDoctors] = useState([]);
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(null);

    const columns = [
        { field: 'firstName', headerName: 'First Name', width: 130 },
        { field: 'lastName', headerName: 'Last name', width: 130 },
        {
            field: 'specialization',
            headerName: 'Specialization',
            width: 130,
        },
    ];

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://localhost:8080/doctors");
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const doctorsData = await response.json();
                setDoctors(doctorsData);

            }  catch (err) {
                setError(err.message);
            }
        };
        fetchDoctors();
    }, []);

    useEffect(() => {
        const mappedRows = doctors.map((doctor) => ({
            id: doctor.id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialization: doctor.specialization.name,
        }));
        setRows(mappedRows);
    }, [doctors]);

    const toggleExpand = (doctorId) => {
        setExpandedDoctor(expandedDoctor === doctorId ? null : doctorId);
    };

    const handleDelete = (doctorId) => {
        // Add delete logic here, e.g., a confirmation modal and API call
        alert(`Delete doctor with ID: ${doctorId}`);
    };

    const handleEdit = (doctor) => {
        // Add edit logic here, e.g., open a modal with doctor's data
        alert(`Edit doctor: ${doctor.firstName} ${doctor.lastName}`);
    };

    return (
        <>
            {doctors.length > 0 ? (
                <DoctorsTable rows={rows} columns={columns}/>
            ) : (
                <p>No doctors</p>
            )}
        </>
    );

    // return (
    //     <div>
    //         <h1>Doctor Management</h1>
    //         {error && <p style={{color: 'red'}}>{error}</p>}
    //         <ul>
    //             {doctors.map((doctor) => (
    //                 <li key={doctor.id} style={{
    //                     marginBottom: '20px',
    //                     listStyleType: 'none',
    //                     border: '1px solid #ddd',
    //                     padding: '10px',
    //                     borderRadius: '5px'
    //                 }}>
    //                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    //                         <span>{doctor.firstName} {doctor.lastName} - {doctor.specialization.name}</span>
    //                         <button style={{marginLeft: '10px'}} onClick={() => toggleExpand(doctor.id)}>
    //                             {expandedDoctor === doctor.id ? 'Hide Appointments' : 'Show Appointments'}
    //                         </button>
    //                     </div>
    //                     {expandedDoctor === doctor.id && (
    //                         <div style={{marginTop: '10px', paddingLeft: '20px', borderLeft: '2px solid #ccc'}}>
    //                             <h4>Appointments:</h4>
    //                             <ul>
    //                                 {/* Replace with fetched appointments */}
    //                                 <li>Appointment 1</li>
    //                                 <li>Appointment 2</li>
    //                                 <li>Appointment 3</li>
    //                             </ul>
    //                             <div style={{marginTop: '10px'}}>
    //                                 <button style={{marginRight: '10px'}} onClick={() => handleEdit(doctor)}>Edit
    //                                 </button>
    //                                 <button onClick={() => handleDelete(doctor.id)}>Delete</button>
    //                             </div>
    //                         </div>
    //                     )}
    //                 </li>
    //             ))}
    //         </ul>
    //     </div>
    // );
}

export default Admin;