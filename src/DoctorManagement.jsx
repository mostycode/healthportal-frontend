import React, { useEffect, useState } from 'react';
import {
    Box,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ConfirmationModal from "./ConfirmationModal.jsx";
import DoctorEditModal from "./DoctorEditModal.jsx";

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [expandedDoctor, setExpandedDoctor] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(false)
    const [appointments, setAppointments] = useState({});
    const [specializations, setSpecializations] = useState([]);
    const [confirmationModalShow, setConfirmationModalShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [modalBody, setModalBody] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://localhost:8080/doctors");
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const doctorsData = await response.json();
                setDoctors(doctorsData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchDoctors();
    }, [fetchTrigger]);

    const fetchAppointments = async (doctorId) => {
        try {
            const response = await fetch(`http://localhost:8080/appointments/doctor?id=${doctorId}`);
            if (!response.ok) {
                throw new Error(`Error fetching appointments: ${response.status}`);
            }
            const appointmentsData = await response.json();
            setAppointments((prev) => ({ ...prev, [doctorId]: appointmentsData }));
            console.log(appointments);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleExpand = (doctorId) => {
        if (expandedDoctor === doctorId) {
            setExpandedDoctor(null);
        } else {
            setExpandedDoctor(doctorId);
            if (!appointments[doctorId]) {
                fetchAppointments(doctorId);
            }
        }
    };

    const handleDelete = (doctor) => {
        console.log(`Delete doctor with ID: ${doctor.id}?`);
        setSelectedDoctor(doctor);

        const formattedBody = (
            <>
                <p>Delete Dr. {doctor.firstName} {doctor.lastName}</p>
                <p>This action cannot be undone</p>
                <p>All appointments will be cancelled</p>
            </>
        );
        setModalBody(formattedBody);
        setConfirmationModalShow(true);
    };

    const handleConfirmationmModalConfirm = async () => {

         try {
             const req = await fetch(`http://localhost:8080/doctors/del/${selectedDoctor.id}`, {
                 method: "DELETE",
             });

             if (!req.ok) {
                 throw new Error(`Error deleting doctor, ${req.status}`)
             }
             console.log('doctor deleted successflly');
             setFetchTrigger((prev) => !prev);
         } catch(err) {
            console.error('Error deleting doctor', err);
            setError(err.message);
         }

        setConfirmationModalShow(false);
    };

    const handleEdit = async (doctor) => {
        console.log(`Edit doctor: ${doctor.firstName} ${doctor.lastName}`);
        setSelectedDoctor(doctor);

        try {
            const res = await fetch(`http://localhost:8080/specializations`);
            if (!res.ok) {
                throw new Error(`Error fetching specializations: ${res.status}`);
            }
            const specializationData = await res.json();
            setSpecializations(specializationData);
        } catch (err) {
            setError(err.message);
        }

        setEditModalShow(true);
    };

    const handleEditModalSubmit = async (updatedDoctor) => {
        try {
            const req = await fetch(`http://localhost:8080/`)
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <>
        <TableContainer component={Paper} sx={{ width: '75%', margin: 'auto' }}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>Doctor Name</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {doctors.map((doctor) => (
                        <React.Fragment key={doctor.id}>
                            <TableRow>
                                <TableCell>
                                    <IconButton
                                        aria-label="expand row"
                                        size="small"
                                        onClick={() => toggleExpand(doctor.id)}
                                    >
                                        {expandedDoctor === doctor.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {doctor.firstName} {doctor.lastName}
                                </TableCell>
                                <TableCell>{doctor.specialization.name}</TableCell>
                                <TableCell align="right">
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleEdit(doctor)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDelete(doctor)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                    <Collapse in={expandedDoctor === doctor.id} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Appointments
                                            </Typography>
                                            <Table size="small" aria-label="appointments">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date & Time</TableCell>
                                                        <TableCell>Patient Name</TableCell>
                                                        <TableCell>Visit Type</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {appointments[doctor.id] ? (
                                                        appointments[doctor.id].length > 0 ? (
                                                            appointments[doctor.id].map((appointment) => (
                                                                <TableRow key={appointment.id}>
                                                                    <TableCell>{appointment.appointmentDateTime.replace('T', ' ')}</TableCell>
                                                                    <TableCell>
                                                                        {appointment.patient.firstName} {appointment.patient.lastName}
                                                                    </TableCell>
                                                                    <TableCell>{appointment.visitType}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={3}>No appointments available</TableCell>
                                                            </TableRow>
                                                        )
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={2}>Loading...</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
            <ConfirmationModal
                show={confirmationModalShow}
                onHide={() => setConfirmationModalShow(false)}
                onConfirm={handleConfirmationmModalConfirm}
                title={"Delete Doctor"}
                body={modalBody}
            />
            <DoctorEditModal
                show={editModalShow}
                onHide={() => setEditModalShow(false)}
                onConfirm={handleEditModalSubmit}
                title={"Delete Doctor"}
                body={modalBody}
            />
        </>
    );
};

export default DoctorManagement;
