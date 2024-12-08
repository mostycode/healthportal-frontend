import {useState} from "react";

function Login () {
    const [user, setUser] = useState({
        userName: '',
        password: '',
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user, [name]: value,
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("form submitted");
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    username:
                    <input
                        type="text"
                        name="userName"
                        value={user.userName}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    password:
                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleInputChange}
                        required
                    />
                </label>
            </form>
        </div>
    );
}

export default Login;