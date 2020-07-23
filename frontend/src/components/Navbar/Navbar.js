
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import classes from './Navbar.module.css';
// import AppIcon from '../../assets/images/icon3.jpg';
import AppIcon from '../../assets/images/appIcon.jpg';
import { Icon } from 'semantic-ui-react';

const onHamburgerMenuClick = () => {
    const sidebar = document.getElementById('side-bar');
    sidebar.classList.toggle(classes.DisplaySidebar);
}

const dropdownToggleMainNav = () => {
    const dropdown = document.getElementById('dropdown-list-mainNav');
    if(dropdown.style.display === 'block'){
        dropdown.style.display = 'none';
    }
    else{
        dropdown.style.display = 'block';
    }
}

const dropdownToggleSidebar = () => {
    const dropdown = document.getElementById('dropdown-list-sidebar');
    if(dropdown.style.display === 'block'){
        dropdown.style.display = 'none';
    }
    else{
        dropdown.style.display = 'block';
    }
}

const navBar = (props) => {
    const { isAuth } = props;

    const links = (
        <React.Fragment>
            { isAuth ? 
                <li>
                    <NavLink to='/feed' activeStyle={{color: 'yellow'}}>Feed</NavLink>
                </li> 
            : null }
            { isAuth ? 
                <li>
                    <NavLink to='/add-post' activeStyle={{color: 'yellow'}}>Add Post</NavLink>
                </li> 
            : null }
            { isAuth ?
                    <li>
                    <NavLink to='/chats' activeStyle={{color: 'yellow'}}>Chats</NavLink>
                </li> 
            : null }
            { isAuth ?
                    <li>
                    <NavLink to='/saved-posts' activeStyle={{color: 'yellow'}}>Saved</NavLink>
                </li> 
            : null }
            { isAuth ? 
                <li>
                    <NavLink to='/notifications' activeStyle={{color: 'yellow'}}>Notifications</NavLink>
                </li> 
            : null }
            { !isAuth ? 
                <li>
                    <NavLink to='/login' activeStyle={{color: 'yellow'}}>Login</NavLink>
                </li> 
            : null }
            { !isAuth ? 
                <li>
                    <NavLink to='/signup' activeStyle={{color: 'yellow'}}>Signup</NavLink>
                </li> 
            : null }
            { isAuth ? 
                <li>
                    <button className={classes.NavbarButton} onClick={props.setStatusToLogout}>Logout</button>
                </li> 
            : null }
        </React.Fragment>
    )
    return(
        <React.Fragment>
            <div className={classes.RootContainer}>
                <div className={classes.IconContainer}>
                    <img src={AppIcon} alt='MainIcon' />
                </div>
                <div className={classes.LinksContainer}>
                    <ul>
                        { isAuth ? 
                            <li>
                                <div className={classes.Dropdown}  onClick={dropdownToggleMainNav}>
                                    <button className={classes.DropdownHeader}>
                                        {props.userInfo.username}
                                        <Icon name='dropdown' style={{marginLeft: '8px'}} id='caret'/>
                                    </button>
                                    <div className={classes.DropdownItemsContainer} id='dropdown-list-mainNav'>
                                        <Link to='/my-profile'>Profile</Link>
                                        <Link to='/my-posts'>My Posts</Link>
                                        <Link to='/'>More...</Link>
                                    </div>
                                </div>
                            </li> 
                        : null }
                        {links}
                    </ul>
                </div>
                <div className={classes.HamburgerMenu} onClick={onHamburgerMenuClick}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div className={classes.SideBar} id='side-bar'>
                <ul>
                    { isAuth ? 
                        <li>
                            <div className={classes.Dropdown}  onClick={dropdownToggleSidebar}>
                                <button className={classes.DropdownHeader}>
                                    {props.userInfo.username}
                                    <Icon name='dropdown' style={{marginLeft: '8px'}} id='caret'/>
                                </button>
                                <div className={classes.DropdownItemsContainer} id='dropdown-list-sidebar'>
                                    <Link to='/my-profile'>Profile</Link>
                                    <Link to='/my-posts'>My Posts</Link>
                                    <Link to='/'>More...</Link>
                                </div>
                            </div>
                        </li> 
                    : null }
                    {links}
                </ul>
            </div>
        </React.Fragment>
    )
};

const mapStateToProps = state => {
    return {
        isAuth: state.auth.isAuth
    }
}

export default connect(mapStateToProps)(navBar);