
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TextField from '@mui/material/TextField';
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useEffect, useState} from "react";

function EditModal({ show, onHide, handleModalConfirm, title, appointmentData }) {
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        doctorId: '',
        appointmentDateTime: '',
        visitType: '',
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            const fetchSpecializations = async () => {
                try {
                    const response = await fetch("http://localhost:8080/specializations");
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    const specializationData = await response.json();
                    setSpecializations(specializationData);
                }  catch (err) {
                    setError(err.message);
                }
            };
            fetchSpecializations();
        }
    }, [show]);

    useEffect(() => {
        if (selectedSpecialization) {
            const fetchDoctors = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/doctors/s?id=${selectedSpecialization}`);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    const doctorsData = await response.json();
                    setDoctors(doctorsData);

                    if (!doctorsData.some((doctor) => doctor.id === formData.doctorId)) {
                        setFormData((prev) => ({
                            ...prev,
                            doctorId: ''
                        }));
                    }
                } catch (err) {
                    setError(err.message);
                }
            };

            fetchDoctors();
        } else {
            // Clear doctors list if no specialization is selected
            setDoctors([]);
            setFormData((prev) => ({
                ...prev,
                doctorId: ''
            }));
        }
    }, [selectedSpecialization]);

    useEffect(() => {
        if (show && appointmentData) {
            setFormData({
                email: appointmentData.patient.email,
                firstName: appointmentData.patient.firstName,
                lastName: appointmentData.patient.lastName,
                doctorId: appointmentData.doctor.id,
                appointmentDateTime: appointmentData.appointmentDateTime, // Remove seconds for datetime-local input
                visitType: appointmentData.visitType
            });
            setSelectedSpecialization(appointmentData.doctor.specialization.id);
            console.log(formData.appointmentDateTime);
        }
    }, [show, appointmentData]);

    useEffect(() => {
        if (!show) {
            // Clear form data and doctor list when modal is closed
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                doctorId: '',
                appointmentDateTime: '',
                visitType: '',
            });
            setDoctors([]);
            setSelectedSpecialization('');
        }
    }, [show]);

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value,
        })
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    <h3>{title}</h3>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {appointmentData && (<Box
                    component="form"
                    sx={{ '& .MuiTextField-root': { m: 1, width: '20ch' } }}
                    noValidate
                    autoComplete="off"
                    >
                    <TextField
                        required
                        id="outlined-required"
                        label="First Name"
                        value={formData.firstName}
                        disabled
                    />
                    <TextField
                        required
                        id="outlined-required"
                        label="Last Name"
                        value={formData.lastName}
                        disabled
                    />

                    <TextField
                        label="Appointment Date"
                        type="datetime-local"
                        name="appointmentDateTime"
                        value={formData.appointmentDateTime}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Specialization"
                        name="specialization"
                        value={specializations.length ? selectedSpecialization : ''}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                        select
                    >
                        {specializations.map((s) => (
                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Doctor"
                        name="doctorId"
                        value={doctors.length ? formData.doctorId : ''}
                        onChange={handleInputChange}
                        select
                    >
                        {doctors.map((d) => (
                            <MenuItem key={d.id} value={d.id}>{d.firstName} {d.lastName}</MenuItem>
                        ))}

                    </TextField>
                    <TextField
                        label="Visit Type"
                        name="visitType"
                        value={formData.visitType}
                        onChange={handleInputChange}
                        select
                    >
                        <MenuItem value="IN_PERSON">In Person</MenuItem>
                        <MenuItem value="TELEHEALTH">Telehealth</MenuItem>
                    </TextField>
                </Box>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => handleModalConfirm(formData)}>
                    Confirm
                </Button>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditModal;
