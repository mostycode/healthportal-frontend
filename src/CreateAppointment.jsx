import {useEffect, useState} from "react";
import ConfirmationModal from "./ConfirmationModal.jsx";
import {useSpecializations} from "./SpecializationsContext.jsx";
import {Button, Container, MenuItem} from "@mui/material";
import TextField from "@mui/material/TextField";
import {DatePicker, DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";


function CreateAppointment() {
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
    const [message, setMessage] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalShow, setModalShow] = useState(false);

    // fetch doctors based on selected specialization
    useEffect(() => {
        if (selectedSpecialization) { // only when specialization is selected
            const fetchDoctors = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/doctors/s?id=${selectedSpecialization}`);
                    if (response.ok) {
                        const doctorsData = await response.json();
                        setDoctors(doctorsData);
                    } else {
                        return handleError(`Error finding doctors`);
                    }
                } catch (err) {
                    handleError(`An unexpected error occurred. Please try again.`);
                    console.log(err);
                }
            };

            fetchDoctors();
        }
    }, [selectedSpecialization]);

    const handleInputChange = (eOrName, value) => {
        // direct call for pickers *mui pickers pass the value directly and not the event object
        if (typeof eOrName === "string") {

            const name = eOrName;
            const parsedValue = dayjs(value);

            // need this to make sure the date is valid before calling .toISOString()
            if (parsedValue.isValid()) {
                setFormData((prev) => ({
                    ...prev,
                    [name]: name === "dateOfBirth" ? parsedValue.toISOString().slice(0, 10) : // Date fields
                        name === "appointmentDateTime" ? parsedValue.format('YYYY-MM-DDTHH:mm') :      // DateTime fields
                            value,
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

    // fires the confirmation modal and sets the modalBody with the confirmation message
    const handleSubmit = () => {
        const formattedBody = (
            <>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.appointmentDateTime}</p>
                <p>
                    {formData.visitType === "IN_PERSON" ? (
                        <>
                            In Person
                            <br/>
                            Please arrive 15 minutes before the scheduled appointment time.
                        </>
                    ) : (
                        "Telehealth"
                    )}
                </p>
            </>
        );

        setModalBody(formattedBody);
        setModalShow(true);
    };

    // handles the confirm button on the confirmation modal
    const handleConfirm = async () => {
        setModalShow(false);
        setError(null);

        try {
            // tries to find patient by email
            const patientResponse = await fetch(`http://localhost:8080/api/patients/e?email=${formData.email}`);
            let patientId;

            // if response ok grab the patient ID
            if (patientResponse.ok) {
                const patientData = await patientResponse.json();

                // in first name, last name, and/or dob dont match the record in db
                if (
                    patientData.firstName !== formData.firstName ||
                    patientData.lastName !== formData.lastName ||
                    patientData.dateOfBirth !== formData.dateOfBirth
                ) {
                    return handleError('The provided details do not match the existing record for this email.');
                }

                patientId = patientData.id;
            } else if (patientResponse.status === 404) {
                // if email wasn't found, create a new patient with the information provided
                const createPatientResponse = await fetch("http://localhost:8080/api/patients", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        dateOfBirth: formData.dateOfBirth,
                        email: formData.email,
                    }),
                });
                // patient created successfully, grab the id
                if (createPatientResponse.ok) {
                    const newPatientData = await createPatientResponse.json();
                    patientId = newPatientData.id;
                } else {
                    return handleError('The system has encountered a problem creating patient');
                }
            }
            // proceed to creating the appointment
            const createAppointmentResponse = await fetch("http://localhost:8080/api/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patientId: patientId,
                    doctorId: formData.doctorId,
                    appointmentDateTime: formData.appointmentDateTime,
                    visitType: formData.visitType,
                })
            });
            if (createAppointmentResponse.ok) {
                const appointmentData = await createAppointmentResponse.json();
                setMessage(`Appointment created successfully with ID: ${appointmentData.id}`);
                setFormData(initialForm);
            } else if (createAppointmentResponse.status === 409) {
                return handleError("An appointment with this doctor already exists for the given patient on the same day. " +
                    "Please choose a different day or doctor.");
            } else {
                return handleError(`The system has encountered a problem creating the appointment`);
                // throw new Error(`Error creating appointment: ${createAppointmentResponse.status}`)
            }

        } catch(err) {
            handleError("An unexpected error occurred. Please try again.");
            console.error(err);
        }
    };

    const handleError = (message) => {
        setError(message);
    };

    return (
        <>
            <Container
                component="form"
                maxWidth="sm"
                sx={{
                    '& .MuiTextField-root': { m: 1, width: '25ch' },
                    p: 3,
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
                noValidate
                autoComplete="on"
            >
                {
                    (error && <div style={{ color: 'red' }}>{error}</div>) ||
                    (message && <div>{message}</div>)
                }
                <TextField
                    required
                    id="outlined-required"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />

                <TextField
                    required
                    id="outlined-required"
                    label="First Name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                />

                <TextField
                    required
                    id="outlined-required"
                    label="Last Name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date of Birth"
                        value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                        onChange={(newValue) => handleInputChange("dateOfBirth", newValue)}
                        maxDate={dayjs()}
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
                    disabled={!selectedSpecialization || doctors.length === 0}
                    onChange={handleInputChange}
                    select
                >
                    {doctors.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.firstName} {d.lastName}</MenuItem>
                    ))}

                </TextField>

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
                    label="Visit Type"
                    name="visitType"
                    value={formData.visitType}
                    onChange={handleInputChange}
                    select
                >
                    <MenuItem value="IN_PERSON">In Person</MenuItem>
                    <MenuItem value="TELEHEALTH">Telehealth</MenuItem>
                </TextField>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Create Appointment
                </Button>
            </Container>

            <ConfirmationModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onConfirm={handleConfirm}
                title={"Confirm Appointment"}
                body={modalBody}
            />
        </>
    );
}

export default CreateAppointment;
