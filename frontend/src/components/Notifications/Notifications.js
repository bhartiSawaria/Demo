
import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './Notifications.module.css';
import Spinner from '../Spinner2/Spinner2';
import Notification from './Notification/Notification';

class Notifications extends Component{

    state = {
        notifications: [],
        isLoading: true
    }

    componentDidMount(){
        fetch('https://backend-hello-world/notifications',{
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.props.token
            }
        })
        .then(result => {
            console.log('Result 1', result);
            return result.json();
        })
        .then(result => {
            console.log('Result 2', result);
            // console.log
            // const notifications = result.reverse();
            const notifications = result.notifications.reverse();
            this.setState({notifications: notifications, isLoading: false});
            console.log('state 1', this.state);
        })
        .catch(err => {
            console.log('Error in notifications component', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    render(){

        let notifications = null;
        notifications = this.state.notifications.map(notification => {
            return <Notification key={notification._id} message={notification.message} id={notification._id} token={this.props.token}/>
        });

        if(this.state.notifications.length === 0){
            notifications = <p style={{fontSize: '16px'}}>No new notifications</p>
        }

        if(this.state.isLoading){
            notifications = <Spinner />
        }
        return(
            <div className={classes.RootContainer}>
                <p className={classes.MainHeader}>Notifications</p>
                <hr/>
                {notifications}
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(Notifications);