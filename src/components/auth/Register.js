import React, { Component } from "react";
import { Grid , Form , Segment , Button , Header, Message , Icon} from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase from "../../firebase"; 
import md5 from "md5";

class Register extends Component {
    state = {
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        errors: [],
        loading: false,
        usersRef: firebase.database().ref("users")
    };

    isFormValid = () => {

        let errors = [];
        let error;
        if(this.isFormEmpty(this.state)) {
            // throw error
            error= {message: "Fill in the fields"};
            this.setState({errors: errors.concat(error)});
            return false;
        } else if (!this.isPasswordValid(this.state)) {
            // throw error
            error = { message: "Password is invalid"};
            this.setState({errors: errors.concat(error)});
            return false;
        } else {
            return true;
        }
    }

    isPasswordValid = ({ password , passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        } else if (password !== passwordConfirmation) {
            return false;
        } else {
            return true;
        }

    }

    displayErrors = errors => errors.map((error, i) => <p key={i}> {error.message} </p>)

    isFormEmpty = ({username, email , password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || 
        !passwordConfirmation.length;
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }
    
    handleSubmit = (event) => {
        event.preventDefault();
        if(this.isFormValid()) 
        {
            this.setState({errors: [] , loading: true});

            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)   
                .then(createdUser => {
                    console.log(createdUser);
                    createdUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                    })
                    .then(() => {
                        this.saveUser(createdUser).then(() => {
                            console.log("User saved");
                        })
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({errors: this.state.errors.concat(err), loading: false});
                    })
                })
                .catch(err => {
                    console.error(err);
                    this.setState({errors: this.state.errors.concat(err) , loading: false})
                })
        }
    }            

    saveUser = (createdUser) => {
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        });
    }   

    handleInputError = (errors , inputName) => {
        return errors.some(error => 
            error.message.toLowerCase().includes(inputName)) 
            ? "error" 
            : ""
    }

    render() {
        const {username , email, password, passwordConfirmation, errors, loading} = this.state;


        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450}}>
                    <Header as="h1" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange">
                            Register for DevChat
                        </Icon>
                    </Header>
                    <Form onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input fluid 
                                value={username} 
                                name="username" 
                                icon="user" 
                                iconPosition="left" 
                                placeholder="Username" 
                                onChange={this.handleChange} 
                                className={this.handleInputError(errors, "username")}
                                type="text" 
                            />

                            <Form.Input fluid 
                                value={email} 
                                name="email" 
                                icon="mail" 
                                iconPosition="left" 
                                placeholder="Email Address" 
                                onChange={this.handleChange} 
                                className={this.handleInputError(errors, "email")}
                                type="email" 
                            />
                            
                            <Form.Input fluid 
                                value={password} 
                                name="password" 
                                icon="mail" 
                                iconPosition="left" 
                                placeholder="Password" 
                                onChange={this.handleChange} 
                                className={this.handleInputError(errors, "password")}
                                type="password" 
                            />

                            <Form.Input fluid 
                                value={passwordConfirmation} 
                                name="passwordConfirmation" 
                                icon="repeat" iconPosition="left" 
                                placeholder="Password Confirmation" 
                                onChange={this.handleChange}
                                className={this.handleInputError(errors, "passwordConfirmation")}
                                type="password" 
                            />
            
                            <Button disabled={loading} className={loading ? "loading" : ""} color="orange" fluid size="large">Submit </Button>
            
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3> Error </h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message> Already a user? <Link to="/login"> Login </Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
};

export default Register;