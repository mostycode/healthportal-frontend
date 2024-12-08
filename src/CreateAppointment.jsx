import {useEffect, useState} from "react";
import ConfirmationModal from "./ConfirmationModal.jsx";


function CreateAppointment() {
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        doctorId: '',
        appointmentDateTime: '',
        visitType: '',
    });
    const [error, setError] = useState(null);
    const [modalBody, setModalBody] = useState('');
    const [modalShow, setModalShow] = useState(false);

    const now = new Date();

    // Extract year, month, day, hours, and minutes
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Format as YYYY-MM-DDTHH:MM
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    useEffect(() => {
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
    }, []);

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
                } catch (err) {
                    setError(err.message);
                }
            };

            fetchDoctors();
        }
    }, [selectedSpecialization]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        setFormData({
            ...formData, [name]: value,
        });
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Ensure the time is in the future if today is selected
        if (name === "appointmentDateTime") {
            const selectedDate = new Date(value);
            const now = new Date();
            console.log(now.getTime());
            // If the selected date is today, ensure the time is in the future
            if (
                selectedDate.toDateString() === now.toDateString() &&
                selectedDate.getTime() <= now.getTime() + 1800000
            ) {
                alert("Appointments must be scheduled at least 30 minutes in advance. Please select a future time that is at least 30 minutes from now");
                setFormData({
                    ...formData,
                    appointmentDateTime: formattedDateTime,
                });
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedBody = (
            <>
                <p>{formData.firstName} {formData.lastName}</p>
                <p>{formData.appointmentDateTime}</p>
                <p>{formData.visitType}</p>
                {formData.visitType === "IN_PERSON" && (
                    <p>Please arrive 15 minutes before the scheduled appointment time.</p>
                )}
            </>
        );

        setModalBody(formattedBody);
        setModalShow(true);
    };

    const handleConfirm = async () => {
        setModalShow(false);
        setError(null);

        try {
            const patientResponse = await fetch(`http://localhost:8080/patients/e?email=${formData.email}`);
            let patientId;

            if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                if (patientData) {
                    patientId = patientData.id;
                    console.log(patientId);
                }
            } else if (patientResponse.status === 404) {
                const createPatientResponse = await fetch("http://localhost:8080/patients", {
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
                if (createPatientResponse.ok) {
                    const newPatientData = await createPatientResponse.json();
                    patientId = newPatientData.id;
                    console.log("Created new Patient with ID: ", patientId);
                } else {
                    throw new Error(`Error creating patient: ${createPatientResponse.status}`);
                }
            }
            const createAppointmentResponse = await fetch("http://localhost:8080/appointments", {
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
                console.log("Appointment created successfully with ID:", appointmentData.id);
            } else if (createAppointmentResponse.status === 409) {
                setError("An appointment with this doctor already exists for the given patient on the same day. Please choose a different time or doctor.");
            } else {
                throw new Error(`Error creating appointment: ${createAppointmentResponse.status}`)
            }

        } catch(err) {
            console.error('Error during appointment creation:', err);
            setError(err.message);
        }
    };

    return (
        <div>
            <h1>Create Appointment Page</h1>
            {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>
                    *Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <br/>

                <label>
                    *First name:
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <br/>

                <label>
                    *Last name:
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <br/>

                <label>
                    *Date of birth:
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <br/>

                <label>
                    *Specialization:
                    <select name="specializations"
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                            required
                    >
                        <option value="">Select Specialization</option>
                        {specializations.map((specialization) => (
                            <option key={specialization.id} value={specialization.id}>
                                {specialization.name}
                            </option>
                        ))}
                    </select>
                </label>
                <br/>

                <label>
                    *Doctor:
                    <select name="doctorId" value={formData.doctorId} onChange={handleInputChange}
                            disabled={!selectedSpecialization || doctors.length === 0} required>
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.firstName} {doctor.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                <br/>

                <label>
                    *Appointment Date:
                    <input type="datetime-local"
                           name="appointmentDateTime"
                           value={formData.appointmentDateTime}
                           min={formattedDateTime}
                           onChange={handleDateChange} required/>
                </label>
                <br/>

                <label>
                    *Visit Type:
                    <select name="visitType" value={formData.visitType} onChange={handleInputChange} required>
                        <option value="">Select Visit Type</option>
                        <option value="IN_PERSON">In person</option>
                        <option value="TELEHEALTH">Telehealth</option>
                    </select>
                </label>
                <br/>

                <button type="submit">Create Appointment</button>
            </form>

            <ConfirmationModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onConfirm={handleConfirm}
                title={"Confirm Appointment"}
                body={modalBody}
            />
        </div>
    );
}

export default CreateAppointment;