
import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';

import classes from './TextPost.module.css';

class TextPost extends Component{

    state = {
        title: '',
        content: '',
        isLoading: false,
        error: ''
    }

    isInputValid = () => {
        const { content } = this.state;
        return content.trim().length;
    }

    inputChangeHandler = (event) => {
        this.setState({error: ''});
        this.setState({[event.target.name]: event.target.value});
    }

    postSubmitHandler = () => {
        if(this.isInputValid()){
            this.setState({isLoading: true});
            console.log('State before sending', this.state.title, this.state.content);
            fetch('http://localhost:8080/add-post', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.props.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: this.state.title,
                    content: this.state.content 
                 })
            })
            .then(result => {
                console.log('1. Result is ', result);
                return result.json();
            })
            .then(result => {
                console.log('2. Result is ', result);
                this.setState({isLoading: false});
                this.props.history.push('/feed');
            })
            .catch(err => {
                console.log('Error in PostType1', err);
                this.setState({isLoading: false});
                this.props.history.push('/error');
            })
        }
    }

    render(){
        return(
            <div className={classes.RootContainer}>
                <h2>Share your views</h2>
                <div className={classes.InputField}>
                    <input 
                        type='text' 
                        name='title'
                        placeholder='Add a title(optional)'
                        value={this.state.title} 
                        onChange={this.inputChangeHandler}/>
                </div>
                <div className={classes.InputField}>
                    <textarea 
                        name='content'
                        placeholder='Write something...' 
                        rows='10'
                        value={this.state.content}
                        onChange={this.inputChangeHandler} />
                </div>
                <Button 
                    className={classes.PostButton} 
                    loading={this.state.isLoading}
                    color='green'
                    style={{margin: '1rem auto'}}
                    onClick={this.postSubmitHandler}>Post
                </Button>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(TextPost);

