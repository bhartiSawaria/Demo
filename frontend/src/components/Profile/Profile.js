
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button} from 'semantic-ui-react';
import mime from 'mime-types';

import classes from './Profile.module.css';
import Spinner from '../Spinner2/Spinner2';
import Backdrop from '../Backdrop/Backdrop';
import profilePic from '../../assets/images/user2.png';

class Profile extends Component{

    state = {
        user: null,
        image: null,
        isLoading: true,
        showBackdrop: false,
        isDelete: false,
        isEdit: false,
        isEditing: false,
        userInfo: {
            email: '',
            name: '',
            username: ''
        },
        error: '',
        imageError: ''
    }

    componentDidMount(){
        fetch('http://localhost:8080/my-profile', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            console.log('Result is ', result);
            this.setState({user: result.user, isLoading: false, userInfo: {name: result.user.name, username: result.user.username, email: result.user.email}});
        })
        .catch(err => {
            console.log('Error in Profile', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    hideModalAndBackdrop = () => {
        this.setState({showBackdrop: false, isDelete: false, isEdit: false});
    }

    proceedInitialDeleteHandler = () => {
        this.setState({showBackdrop: true, isDelete: true});
    }

    proceedInitialEditHandler = () => {
        const { name, username, email } = this.state.user;
        this.setState({showBackdrop: true, 
            isEdit: true,
            userInfo: {
                name: name, 
                username: username, 
                email: email
            }
        });
    }

    proceedFinalDeleteHandler = () => {
        fetch('http://localhost:8080/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            console.log('Result is ', result);
            this.setState({user: result.user,
                userInfo: {
                    name: result.user.name, 
                    username: result.user.username, 
                    email: result.user.email
                }
            });
            // this.setState({user: result.user, isLoading: false});
        })
        .catch(err => {
            console.log('Error in deleting account', err);
            this.props.history.push('/error');
            // this.setState({isLoading: false});
        })
        
    }

    proceedFinalEditHandler = () => {
        this.setState({isEditing: true});
        fetch('http://localhost:8080/edit-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token
            },
            body: JSON.stringify({
                name: this.state.userInfo.name,
                username: this.state.userInfo.username,
                email: this.state.userInfo.email,
                id: this.props.user.id
            })
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            console.log('Result is ', result);
            let error = '';
            if(result.data){
                error = result.data[0].msg;
                console.log('Error is set.', error);
                this.setState({error: error, isEditing: false});
            }
            else{
                this.setState({user: result.user,
                    userInfo: {
                        name: result.user.name, 
                        username: result.user.username, 
                        email: result.user.email
                    },
                    isEditing: false,
                    error: error
                });
                this.hideModalAndBackdrop();
            }     
        })
        .catch(err => {
            this.setState({isEditing: false});
            console.log('Error in editing account info', err);
            this.props.history.push('/error');
        })
    }

    changeImageInputHandler = (event) => {
        this.setState({imageError: ''});
        this.setState({image: event.target.files[0]});
    }

    isMimeTypeValid = () => {
        if(!this.state.image){
            this.setState({imageError: 'Please select an image.'});
            return false;
        }
        const supportedFiles = ['image/png', 'image/jpg', 'image/jpeg'];
        const mimeType = mime.lookup(this.state.image.name);
        const result = supportedFiles.includes(mimeType);
        if( !result ){
            this.setState({imageError: 'Supported image types are only jpg, png and jpeg.'})
        }
        return result;
    }

    proceedPicChangeHandler = () => {
        if(this.isMimeTypeValid()){
            this.setState({isEditing: true});
            const formData = new FormData();
            formData.append('image', this.state.image);
            formData.append('imageUrl', profilePic);
            fetch('http://localhost:8080/change-profile-pic', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: 'Bearer ' + this.props.token
                }
            })
            .then(result => {
                return result.json();
            })
            .then(result => {
                console.log('Result ', result);
                this.setState({user: result.user, isEditing: false});
                this.hideModalAndBackdrop();
            })
            .catch(err => {
                console.log('Error in changing profile pic', err);
                this.setState({isEditing: false});
                this.props.history.push('/error');
            })
        }
    }

    formInputChangeHandler = (event) => {
        this.setState({error: ''});
        const updatedUserInfo = {...this.state.userInfo};
        updatedUserInfo[event.target.name] = event.target.value;
        this.setState({userInfo: updatedUserInfo});
    }

    render(){

        let error = null;
        if(this.state.error != ''){
            error = <p style={{color: 'red'}}>{this.state.error}</p>
        } 

        let backdrop = null;
        if(this.state.showBackdrop){
            backdrop = <Backdrop clicked={this.hideModalAndBackdrop}/>
        }

        let modal = null;
        if(this.state.isDelete){
            modal = (
                <div className={classes.Modal}>
                    <p style={{fontSize: '20px', marginBottom: '16px'}}>Choose a picture</p>
                    <input 
                        type='file' 
                        onChange={this.changeImageInputHandler}
                        style={{width: '100%', backgroundColor: '#eee', padding: '8px'}}/>
                    <p style={{color: 'red'}}>{this.state.imageError}</p>
                    <Button 
                        loading={this.state.isEditing}
                        className={classes.EditButton} 
                        color='green'
                        onClick={this.proceedPicChangeHandler}>
                        Proceed
                    </Button>
                    <button className={classes.DeleteButton} onClick={this.hideModalAndBackdrop}>Cancel</button>
                </div>
                // <div className={classes.Modal}>
                //     <p>Are you sure you want to delete your account?</p>
                //     <p>This action can not be undone.</p>
                //     <Button 
                //         loading={this.state.isEditing}
                //         className={classes.EditButton} 
                //         color='green'
                //         onClick={this.hideModalAndBackdrop}>
                //         Cancel
                //     </Button>
                //     <button className={classes.DeleteButton} onClick={this.proceedFinalDeleteHandler}>Delete</button>
                // </div>
            )
        }

        let editForm = null;
        if(this.state.isEdit){
            editForm = (
                <div className={classes.EditForm}>
                    <h1 style={{marginBottom: '2rem'}}>EDIT DETAILS</h1>
                    <Input
                        fluid
                        icon='user'
                        iconPosition='left' 
                        name='name'
                        type='text'
                        placeholder='Your Name'
                        value={this.state.userInfo.name}
                        style={{marginBottom: '8px'}}
                        onChange={this.formInputChangeHandler}/>

                    <Input
                        fluid
                        icon='user'
                        iconPosition='left' 
                        name='username'
                        type='text'
                        placeholder='Username'
                        value={this.state.userInfo.username}
                        style={{marginBottom: '8px'}}
                        onChange={this.formInputChangeHandler}/>

                    <Input
                        fluid
                        icon='mail'
                        iconPosition='left' 
                        name='email'
                        type='email'
                        placeholder='Your E-mail'
                        value={this.state.userInfo.email}
                        style={{marginBottom: '8px'}}
                        onChange={this.formInputChangeHandler}/>

                    {error}

                    <Button className={classes.EditButton} onClick={this.proceedFinalEditHandler} loading={this.state.isEditing} color='green'>Edit</Button>
                    <button className={classes.DeleteButton} style={{backgroundColor:'#ff5252', color:'#fff'}} onClick={this.hideModalAndBackdrop}>Cancel</button>
                </div>
            )
        }
         
        return(
            <div className={classes.RootContainer}>
                {backdrop}
                {modal}
                {editForm}
                {this.state.isLoading ? <Spinner /> : (
                    <React.Fragment>
                        <img src={this.state.user.imageUrl} alt='userProfilePic'/>
                        <div className={classes.InfoContainer}>
                            <p>{this.state.user.username}</p>
                            <p>{this.state.user.name}</p>
                            <p>Email: {this.state.user.email}</p>
                        </div>
                        <button 
                            className={classes.EditButton}
                            onClick={this.proceedInitialEditHandler}>Edit Details</button>
                        <button 
                            className={classes.DeleteButton}
                            onClick={this.proceedInitialDeleteHandler}>Change Profile Pic</button>
                    </React.Fragment>
                ) }
            </div>
        )
    }
};

const mapStateToProps = state => {
    return{
        token: state.auth.token,
        user: state.auth.userDetails
    }
}

export default connect(mapStateToProps)(Profile);