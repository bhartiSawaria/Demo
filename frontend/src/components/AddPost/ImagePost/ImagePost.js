
import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';
import mime from 'mime-types';
import { connect } from 'react-redux';

import classes from './ImagePost.module.css';

class ImagePost extends Component{

    state = {
        caption: '',
        image: null,
        supportedFiles: ['image/jpg', 'image/png', 'image/jpeg'],
        isLoading: false,
        error: ''
    }

    inputChangeHandler = (event) => {
        this.setState({error: ''});
        const type = event.target.name;
        if( type === 'caption'){
            this.setState({ caption: event.target.value});
        }
        else{
            const image = event.target.files[0];
            if(image){
                this.setState({ image })
            }
            else{
                this.setState({ image: null });
            }
        }
    }

    isDataValid = () => {
        if(!this.state.image){
            this.setState({error: 'Please select an image.'});
            return false;
        }
        const mimeType = mime.lookup(this.state.image.name);
        const result = this.state.supportedFiles.includes(mimeType);
        if( !result ){
            this.setState({error: 'Supported image types are only jpg, png and jpeg.'})
        }
        return result;
    }

    postSubmitHandler = () => {
        if(this.isDataValid()){
            this.setState({isLoading: true});
            const formData = new FormData();
            formData.append('caption', this.state.caption);
            formData.append('image', this.state.image);
            formData.append('userId', this.props.user.id);

            fetch('https://backend-hello-world/add-post', {
                method: 'POST',
                body: formData,
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
                this.setState({isLoading: false});
                this.props.history.push('/feed');

            })
            .catch(err => {
                console.log(err);
                this.setState({isLoading: false});
                this.props.history.push('/error');
            })
        }
    }

    render(){
        let error = <p style={{color: 'red'}}>{this.state.error}</p>;
        return(
            <div className={classes.RootContainer}>
                <h2>Share your pics</h2>
                <div className={classes.ImageField}>
                    <input 
                        type='file'
                        name='image'
                        onChange={this.inputChangeHandler}/>
                </div>
                <div className={classes.InputField}>
                    <input 
                        type='text' 
                        placeholder='Write a caption(optional)'
                        name='caption'
                        value={this.state.caption}
                        onChange={this.inputChangeHandler}/>
                </div>
                {error}
                <Button
                    loading={this.state.isLoading} 
                    className={classes.PostButton}
                    color='green'
                    style={{margin: '1rem auto'}}
                    onClick={this.postSubmitHandler}>Post</Button>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        user: {...state.auth.userDetails},
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(ImagePost);

