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
    Button, Container
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ConfirmationModal from "./ConfirmationModal.jsx";
import DoctorEditModal from "./DoctorEditModal.jsx";
import {Link} from "react-router-dom";
import {useSpecializations} from "./SpecializationsContext.jsx";
import {Create} from "@mui/icons-material";
import CreateDoctor from "./CreateDoctor.jsx";

const DoctorManagement = () => {
    const { specializations } = useSpecializations();
    const [doctors, setDoctors] = useState([]);
    const [expandedDoctor, setExpandedDoctor] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(false)  // to refresh the list of doctors after editing/adding
    const [appointments, setAppointments] = useState({});
    const [confirmationModalShow, setConfirmationModalShow] = useState(false);
    const [doctorEditModalShow, setDoctorEditModalShow] = useState(false);
    const [modalBody, setModalBody] = useState("");
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch("http://localhost:8080/api/doctors");
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
            const response = await fetch(`http://localhost:8080/api/appointments/doctor?id=${doctorId}`);
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

    const handleAddDoctor = async (formData) => {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
        try {
            const createDoctorReq = await fetch(`http://localhost:8080/api/doctors/create`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(formData),
            });
            if (createDoctorReq.ok) {
                console.log(`doctor created successfully`);
                setFetchTrigger((prev) => !prev);
                setShowAddForm(false);
            } else {
                throw new Error(`Error creating doctor, ${createDoctorReq.status}`)
            }
        } catch (err) {
            console.log(err)
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
         const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
         console.log(csrfToken);
         try {
             const req = await fetch(`http://localhost:8080/api/doctors/del/${selectedDoctor.id}`, {
                 method: "DELETE",
                 credentials: "include",
                 headers: {
                     'X-XSRF-TOKEN': csrfToken,
                 },
             });

             if (!req.ok) {
                 throw new Error(`Error deleting doctor, ${req.status}`)
             }
             console.log('doctor deleted successfully');
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
            const res = await fetch(`http://localhost:8080/api/specializations`);
            if (!res.ok) {
                throw new Error(`Error fetching specializations: ${res.status}`);
            }
            const specializationData = await res.json();
            setSpecializations(specializationData);
        } catch (err) {
            setError(err.message);
        }

        setDoctorEditModalShow(true);
    };

    const handleEditModalSubmit = async (updatedDoctor) => {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
        console.log(`edited doctor with ID: ${selectedDoctor.id}`, updatedDoctor);
        try {
            const req = await fetch(`http://localhost:8080/api/doctors/edit/${selectedDoctor.id}`,{
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(updatedDoctor),
            })
            if (!req.ok) {
                throw new Error(`Error editing doctor, ${req.status}`)
            }
            console.log('doctor updated successfully');
            setFetchTrigger((prev) => !prev);
        } catch (err) {
            setError(err.message);
        }
        setDoctorEditModalShow(false);
    };

    return (
        <>
            <Container
                maxWidth="sm"
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                {(
                    showAddForm &&
                        <CreateDoctor
                            onAddDoctor={handleAddDoctor}
                            onHide={() => (setShowAddForm(false))}
                        />
                ) || (
                    <Button
                        variant="contained"
                        onClick={() => (setShowAddForm(true))}
                    >New Doctor</Button>
                )}
            </Container>
            <TableContainer component={Paper} sx={{ width: '75%', margin: 'auto', mb: 2 }}>
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
                show={doctorEditModalShow}
                onHide={() => setDoctorEditModalShow(false)}
                onConfirm={handleEditModalSubmit}
                title={"Edit Doctor"}
                selectedDoctor={selectedDoctor}
            />
        </>
    );
};

export default DoctorManagement;
