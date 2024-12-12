import Modal from "react-bootstrap/Modal";
import {Box, MenuItem} from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "react-bootstrap/Button";
import {useEffect, useState} from "react";
import {useSpecializations} from "./SpecializationsContext.jsx";


const DoctorEditModal = ({ show, onHide, onConfirm, title, selectedDoctor }) => {
    const { specializations } = useSpecializations();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        specializationId: '',
    });

    useEffect(() => {
        if (show && selectedDoctor) {
            setFormData({
                firstName: selectedDoctor.firstName,
                lastName: selectedDoctor.lastName,
                specializationId: selectedDoctor.specialization.id,
            });
        }
    }, [show, selectedDoctor]);

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
                {selectedDoctor && (<Box
                        component="form"
                        sx={{ '& .MuiTextField-root': { m: 1, width: '20ch' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            required
                            id="outlined-required"
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            required
                            id="outlined-required"
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />

                        <TextField
                            label="Specialization"
                            name="specializationId"
                            value={formData.specializationId}
                            onChange={handleInputChange}
                            select
                        >
                            {specializations.map((s) => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
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
};

export default DoctorEditModal;