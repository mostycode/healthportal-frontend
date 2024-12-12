
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import TextField from '@mui/material/TextField';
import {Box, MenuItem} from "@mui/material";
import {useEffect, useState} from "react";
import {useSpecializations} from "./SpecializationsContext.jsx";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs from "dayjs";

function EditModal({ show, onHide, onConfirm, title, appointmentData }) {
    const { specializations } = useSpecializations();

    const initialForm = {
        email: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        doctorId: '',
        appointmentDateTime: '',
        visitType: '',
    };

    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState(null);

    // need to refactor for double use in CreateAppointment
    useEffect(() => {
        if (selectedSpecialization) {
            const fetchDoctors = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/doctors/s?id=${selectedSpecialization}`);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    const doctorsData = await response.json();
                    setDoctors(doctorsData);

                    // when specialization changes, clear the doctorId
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
    }, [formData.doctorId, selectedSpecialization]);

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
            console.log(appointmentData.doctor.specialization.id);
        }
    }, [show, appointmentData]);

    useEffect(() => {
        if (!show) {
            // Clear form data and doctor list when modal is closed
            setFormData(initialForm);
            setDoctors([]);
            setSelectedSpecialization('');
        }
    }, [show]);

    const handleInputChange = (eOrName, value) => {
        // direct call for pickers *mui pickers pass the value directly and not the event object
        if (typeof eOrName === "string") {

            const name = eOrName;
            const parsedValue = dayjs(value);

            // need this to make sure the date is valid before calling .toISOString()
            if (parsedValue.isValid()) {
                setFormData((prev) => ({
                    ...prev,
                    // [name]: name === "appointmentDateTime" ? value.toISOString() :      // DateTime fields
                    //         value,
                    [name]: name === "appointmentDateTime" ? parsedValue.format('YYYY-MM-DDTHH:mm') : value,

                }))
            }

        } else {
            // Event object for TextField
            const { name, value } = eOrName.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        console.log(formData);
    };

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

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            required
                            label="Appointment Date & Time"
                            name="appointmentDateTime"
                            value={formData.appointmentDateTime ? dayjs(formData.appointmentDateTime) : null}
                            onChange={(newValue) => handleInputChange("appointmentDateTime", newValue)}
                            minDateTime={dayjs()}
                        />
                    </LocalizationProvider>

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
                <Button variant="primary" onClick={() => onConfirm(formData)}>
                    Confirm
                </Button>
                <Button onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditModal;
