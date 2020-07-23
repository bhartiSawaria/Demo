
import React, { Component } from 'react';
import { connect } from 'react-redux';

import classes from './Feed.module.css';
import Post from './Post/Post';
import Spinner from '../Spinner2/Spinner2';

class Feed extends Component{

    state = {
        posts: [],
        isLoading: true
    }

    sortByDateAsc = (a, b) => { 
        if(a.createdAt < b.createdAt){
            return 1;
        }
        return -1;
    }

    componentDidMount(){
        fetch('https://backend-hello-world/feed',{
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
            const posts = result.posts;
            posts.sort(this.sortByDateAsc);
            this.setState({posts: posts, isLoading: false});
            console.log('state 1', this.state);
        })
        .catch(err => {
            console.log('Error in feed', err);
            this.setState({isLoading: false});
            this.props.history.push('/error');
        })
    }

    render(){
        let feed = this.state.posts.map(post => {
            return <Post key={post._id} post={post} token={this.props.token}/>
        });

        if(this.state.isLoading){
            feed = <Spinner />
        }
        
        return(
            <div className={classes.RootContainer}>
                {feed}
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(Feed);