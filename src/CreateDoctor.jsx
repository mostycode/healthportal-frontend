import TextField from "@mui/material/TextField";
import {Button, Container, MenuItem} from "@mui/material";
import {useState} from "react";
import {useSpecializations} from "./SpecializationsContext.jsx";

function CreateDoctor({ onHide, onAddDoctor }) {
    const { specializations } = useSpecializations();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        specializationId: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value,
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddDoctor(formData);
    }
    return (
        <Container
            component="form"
            sx={{'& .MuiTextField-root': {m: 1, width: '30ch'}, justifyContent: 'center', display: 'flex', flexDirection: 'column'}}
            noValidate
            autoComplete="off"
        >
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 2, // Adds space between inputs
                }}
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
                    required
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
            </Container >
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 2, // Adds space between inputs
                }}
            >
                <Button
                    type="submit"
                    variant="contained"
                    onClick={handleSubmit}
                >Add Doctor</Button>
                <Button
                    variant="contained"
                    onClick={onHide}
                >Cancel</Button>
            </Container >

        </Container>
    );
}

export default CreateDoctor;