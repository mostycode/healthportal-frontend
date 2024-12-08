import {useEffect, useState} from "react";
import AppointmentsTable from "./AppointmentsTable.jsx";

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [hoveredRow, setHoveredRow] = useState(null);

    const fetchAppointmentsForPatient = async (patientId) => {
        try {
            const appointmentResponse = await fetch(`http://localhost:8080/appointments/patient?id=${patientId}`);

            if (appointmentResponse.ok) {
                const data = await appointmentResponse.json();
                setAppointments(data);
            } else {
                throw new Error(`Error fetching appointments: ${appointmentResponse.status}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const patientResponse = await fetch(`http://localhost:8080/patients/e?email=${email}`);

            if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                if (patientData) {
                    setPatientId(patientData.id);
                    await fetchAppointmentsForPatient(patientData.id);
                } else {
                    console.log("patient does not exist");
                }
            } else {
                throw new Error(`Error finding patient: ${patientResponse.status}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        e.preventDefault();
        setEmail(e.target.value);
    };

    const handleEditSubmit = async (id, updatedAppointment) => {
        try {
            if (!updatedAppointment.appointmentDateTime) {
                console.error("Appointment DateTime is not properly set.");
                console.log(updatedAppointment);
                return; // Do not proceed if the date-time is null or empty
            }
            const req = await fetch(`http://localhost:8080/appointments/edit/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedAppointment),
            });
            if (req.ok) {
                console.log("Appointment updated successfully with ID:", id);
                if (patientId) {
                    await fetchAppointmentsForPatient(patientId); // Refresh appointments using patientId from state
                }
            } else if (req.status === 409) {
                setError("An appointment with this doctor already exists for the given patient on the same day. Please choose a different time or doctor.");
            } else {
                throw new Error(`Error creating appointment: ${req.status}`)
            }
        } catch(err) {
            console.error('Error during appointment creation:', err);
            setError(err.message);
        }
    };

    const handleCancelSubmit = async (id) => {
        try {
            const req = await fetch(`http://localhost:8080/appointments/cancel/${id}`, {
                method: "PUT",
            });
            if (!req.ok) {
                throw new Error(`Error canceling appointment: ${req.status}`);
            }
            if (patientId) {
                await fetchAppointmentsForPatient(patientId); // Refresh appointments using patientId from state
            }
            console.log("Appointment canceled successfully");
        } catch(err) {
            console.error('Error during appointment creation:', err);
            setError(err.message);
        }
    }

    return (
        <div className="appointments">
            <h1> Appointments page</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                    />
                </label>

                <button type="submit">Search</button>
            </form>

            <AppointmentsTable
                appointments={appointments}
                handleEditSubmit={handleEditSubmit}
                handleCancelSubmit = {handleCancelSubmit}
            />

        </div>
    );
}

export default Appointments;