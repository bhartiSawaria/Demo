
import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './Chats.module.css';
import User from './User/User';
import Spinner from '../Spinner2/Spinner2';
import firebase from '../../firebase';

let count = 0;

const selectCategoryHandler = () => {
    const chats = document.getElementById('chats');
    const search = document.getElementById('search');
    const chatsContainer = document.getElementById('chats-container');
    const usersContainer = document.getElementById('users-container');

    chats.classList.toggle(classes.Test);
    search.classList.toggle(classes.Test);

    chatsContainer.classList.toggle(classes.DisplayContainer);
    usersContainer.classList.toggle(classes.DisplayContainer);

    chatsContainer.classList.toggle(classes.HideContainer);
    usersContainer.classList.toggle(classes.HideContainer);

}

class Chats extends Component{

    state = {
        users: [],
        isLoading: true,
        messagesRef: firebase.firestore().collectionGroup('messages'),
        contactedUsers: []
    }

    componentDidMount(){
        const currentUserId = this.props.user.id;
        const { messagesRef, contactedUsers } = this.state;
        let loadedUsers = [];

        fetch('http://localhost:8080/users', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            return result.json();
        })
        .then(result => {
            console.log('Result', result);
            console.log(result.users);
            this.setState({users: result.users});
            return messagesRef.get();
        })
        .then(doc => {
            const {users} = this.state;
            doc.forEach(d => {
                let docId = d.id;
                let id = docId.split('-');
                if( id[0] == currentUserId || id[1] == currentUserId){
                    let contactedUserId = id[0] == currentUserId ? id[1] : id[0];
                    let contactedUser = users.find(user => user._id == contactedUserId);
                    loadedUsers.push(contactedUser);
                }
            })
            this.setState({contactedUser: loadedUsers, isLoading: false});
        })
        .catch(err => {
            console.log('Error in Chats component', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    findPeopleClickHandler = () => {
        selectCategoryHandler();
    }

    getId = (id1, id2) => {
        if(id1 < id2){
            return id1 + '-' +  id2;
        }
        return id2 + '-' + id1;
    }

    sendMessageHandler = (receiver) => {
        const path = this.getId(this.props.user.id, receiver._id);
        this.props.history.push('/chats/private/' + path, {
            sender: this.props.user,
            receiver: receiver
        });
    }

    render(){
        let users = this.state.users && this.state.users.map(user => {
            return(
                <User key={user._id} user={user} sendMessage={() => this.sendMessageHandler(user)}/>
            )
        });

        let loadedUsers = this.state.contactedUser && this.state.contactedUser.map(user => {
            count += 1;
            return(
                <User key={user._id} user={user} clicked={() => this.sendMessageHandler(user)}/>
            )
        });

        if(count === 0){
            loadedUsers = <p className={classes.NoChat}>No recent chats</p>
        }

        if(this.state.isLoading){
            users = <Spinner />
            loadedUsers = <Spinner />
        }
        return(
            <div className={classes.RootContainer}>
                <div 
                    className={[classes.ChatTitle, classes.Test].join(' ')} 
                    id='chats' onClick={selectCategoryHandler}>
                    Chats
                </div>
                <div 
                    className={classes.SearchTitle} 
                    id='search' onClick={this.findPeopleClickHandler}>
                    Find People
                </div>
                <div 
                    className={[classes.ChatsContainer, classes.DisplayContainer].join(' ')}
                    id='chats-container'>{loadedUsers}</div>
                <div 
                    className={[classes.UsersContainer, classes.HideContainer].join(' ')}
                    id='users-container'>{users}</div>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        user: state.auth.userDetails
    }
}

export default connect(mapStateToProps)(Chats);