import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from "@mui/material";
import React, {useState} from "react";
import EditModal from "./EditModal.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";

const AppointmentsTable = ({ appointments, handleEditSubmit, handleCancelSubmit }) => {
    const [editModalShow, setEditModalShow] = useState(false);
    const [confirmationModalShow, setConfirmationModalShow] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [modalBody, setModalBody] = useState("");
    const [error, setError] = useState(null);

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setEditModalShow(true);
    }

    const handleCancelAppointment = (appointment) => {
        setSelectedAppointment(appointment);

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

    const handleEditModalConfirm = (formData) => {
        console.log("edited", selectedAppointment)

        handleEditSubmit(selectedAppointment.id, {
            patientId: selectedAppointment.patient.id,
            doctorId: formData.doctorId,
            appointmentDateTime: formData.appointmentDateTime,
            visitType: formData.visitType,
        })

        setEditModalShow(false);
    }

    const handleConfirmationmModalConfirm = () => {
        handleCancelSubmit(selectedAppointment.id);
        console.log(`Appointment ${selectedAppointment.id} deleted...`)
        setConfirmationModalShow(false);
    }
    return (
        <>
        <TableContainer component={Paper} sx={{ width: '75%', marginTop: 2, marginLeft: 'auto', marginRight: 'auto' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Appointment ID</TableCell>
                        <TableCell>Patient</TableCell>
                        <TableCell>Specialization</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Visit Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map((appointment) => (
                        <TableRow
                            key={appointment.id}
                        >
                            <TableCell>
                                {appointment.id}
                            </TableCell>
                            <TableCell>
                                {appointment.patient.firstName} {appointment.patient.lastName}
                            </TableCell>
                            <TableCell>
                                {appointment.doctor.specialization.name}
                            </TableCell>
                            <TableCell>
                                {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </TableCell>
                            <TableCell>
                                {appointment.appointmentDateTime.replace("T", " ")}
                            </TableCell>
                            <TableCell>
                                {appointment.visitType}
                            </TableCell>
                            <TableCell>
                                {appointment.confirmed ? "Confirmed" : "Cancelled"}
                            </TableCell>
                            <TableCell align="right">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleEdit(appointment)}
                                    style={{ marginRight: '10px' }}
                                    disabled={!appointment.confirmed}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleCancelAppointment(appointment)}
                                    disabled={!appointment.confirmed}
                                >
                                    Cancel
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    <EditModal
        show={editModalShow}
        onHide={() => setEditModalShow(false)}
        handleModalConfirm={handleEditModalConfirm}
        title={"Edit Appointment"}
        appointmentData={selectedAppointment}
    />
    <ConfirmationModal
        show={confirmationModalShow}
        onHide={() => setConfirmationModalShow(false)}
        onConfirm={handleConfirmationmModalConfirm}
        title={"Cancel Appointment"}
        body={modalBody}
    />
    </>
    );
}

export default AppointmentsTable;


// {appointment.confirmed && (
//     <>
//         <Button
//             variant="outlined"
//             size="small"
//             onClick={() => handleEdit(appointment)}
//             style={{ marginRight: '10px' }}
//         >
//             Edit
//         </Button>
//         <Button
//             variant="outlined"
//             color="error"
//             size="small"
//             onClick={() => handleCancelAppointment(appointment)}
//         >
//             Cancel
//         </Button>
//     </>
// )}