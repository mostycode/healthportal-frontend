import React, {useEffect, useState} from "react";
import {Button, Container} from "@mui/material";
import TextField from "@mui/material/TextField";
import AppointmentsDataGrid from "./AppointmentsDataGrid.jsx";
import EditModal from "./EditModal.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('Please Enter your email to view your appointments')
    const [rows, setRows] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [confirmationModalShow, setConfirmationModalShow] = useState(false);
    const [modalBody, setModalBody] = useState("");

    // fetching appointments by patientID
    const fetchAppointmentsForPatient = async (patientId) => {
        try {
            const appointmentResponse = await fetch(`http://localhost:8080/api/appointments/patient?id=${patientId}`);

            if (appointmentResponse.ok) {
                const data = await appointmentResponse.json();
                // if (data.length <= 0) setMessage('No appointments available.')
                const transformedRows = data.map((appointment) => ({
                    id: appointment.id,
                    patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
                    specialization: appointment.doctor.specialization.name,
                    doctor: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
                    appointmentDateTime: appointment.appointmentDateTime.replace('T', ' '),
                    visitType: appointment.visitType,
                    status: appointment.confirmed ? 'Confirmed' : 'Cancelled',
                }));
                setRows(transformedRows);
                setAppointments(data);
            } else {
                throw new Error(`Error fetching appointments: ${appointmentResponse.status}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // handling submit/search button
    const handleOnSearch = async () => {

        // fetching user by email
        try {
            const patientResponse = await fetch(`http://localhost:8080/api/patients/e?email=${email}`);

            if (patientResponse.ok) {
                const patientData = await patientResponse.json();

                // sets the patientId and fetch appointments if patient found
                if (patientData) {
                    setPatientId(patientData.id);
                    await fetchAppointmentsForPatient(patientData.id);
                }
            } else {
                setPatientId(null);
                setMessage('patient does not exist');
                throw new Error(`Error finding patient: ${patientResponse.status}`);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (id) => {
        const appointment = appointments.find((appointment) => appointment.id === id);
        setSelectedAppointment(appointment);
        setEditModalShow(true);
    }

    const handleEditSubmit = async (formData) => {
        try {

            const updatedAppointment = {
                patientId: selectedAppointment.patient.id,
                doctorId: formData.doctorId,
                appointmentDateTime: formData.appointmentDateTime,
                visitType: formData.visitType,
            }

            console.log(updatedAppointment);
            const req = await fetch(`http://localhost:8080/api/appointments/edit/${selectedAppointment.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedAppointment),
            });
            if (req.ok) {
                console.log("Appointment updated successfully with ID:", selectedAppointment.id);
                setEditModalShow(false);
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

    // fires the confirmationModal to cancel an appointment
    const handleCancelAppointment = (id) => {

        // setSelectedAppointment is asynchronous and not updated correctly to build formattedBody
        const appointment = appointments.find((appointment) => appointment.id === id);
        setSelectedAppointment(appointment);
        console.log(selectedAppointment);
        const formattedBody = (
            <>
                <p>Cancel appointment for {appointment.patient.firstName} {appointment.patient.lastName}</p>
                <p>on {appointment.appointmentDateTime.slice(0, 10)} at {appointment.appointmentDateTime.slice(11)}</p>
                <p>{appointment.visitType}</p>
            </>
        );
        setModalBody(formattedBody);
        setConfirmationModalShow(true);
    }

    // upon clicking confirm on the ConfirmationModal (cancel the appointment
    const handleCancelSubmit = async () => {
        try {
            const req = await fetch(`http://localhost:8080/api/appointments/cancel/${selectedAppointment.id}`, {
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
        setConfirmationModalShow(false);
    }

    // columns for the dataGrid
    const columns = [
        { field: 'id', headerName: 'Appointment ID', width: 150 },
        { field: 'patient', headerName: 'Patient', width: 100 },
        { field: 'specialization', headerName: 'Specialization', width: 200 },
        { field: 'doctor', headerName: 'Doctor', width: 200 },
        { field: 'appointmentDateTime', headerName: 'Date', width: 200 },
        { field: 'visitType', headerName: 'Visit Type', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
    ];

    return (
        <Container
            maxWidth="75%"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Container
                component="form"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    p: 3,
                }}
                noValidate
                autoComplete="on"
            >
                <TextField
                    size="small"
                    required
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleOnSearch}
                >
                    Search
                </Button>
            </Container>

            {patientId ? (
                <AppointmentsDataGrid
                    rows={rows}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleCancelAppointment}
                />
            ) : (
                <p>{message}</p>
            )}
            <EditModal
                show={editModalShow}
                onHide={() => setEditModalShow(false)}
                onConfirm={handleEditSubmit}
                title={"Edit Appointment"}
                appointmentData={selectedAppointment}
            />
            <ConfirmationModal
                show={confirmationModalShow}
                onHide={() => setConfirmationModalShow(false)}
                onConfirm={handleCancelSubmit}
                title={"Cancel Appointment"}
                body={modalBody}
            />
        </Container>
    );
}

export default Appointments;