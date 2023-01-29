import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

class Login extends Component {
  state = {
    username: '',
    password: '',
    errorMsge: '',
    showError: false,
  }

  onSubmitSuccess = jwtToken => {
    const {history} = this.props
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    history.replace('/')
  }

  onSubmitFailure = errorMsge => this.setState({showError: true, errorMsge})

  onSubmitLogin = async event => {
    event.preventDefault()
    const {username, password} = this.state
    const apiUrl = 'https://apis.ccbp.in/login'
    const userDetails = {username, password}
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      this.onSubmitSuccess(data.jwt_token)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  // On Changing Functions
  onChangeUsername = event => this.setState({username: event.target.value})

  onChangePassword = event => this.setState({password: event.target.value})

  // Username Input
  renderUsername = () => {
    const {username} = this.state

    return (
      <div className="input-container">
        <label className="label-text" htmlFor="username">
          USERNAME
        </label>
        <input
          type="text"
          value={username}
          onChange={this.onChangeUsername}
          placeholder="Username"
          className="input-element"
          id="username"
        />
      </div>
    )
  }

  // Password Input
  renderPassword = () => {
    const {password} = this.state

    return (
      <div className="input-container">
        <label className="label-text" htmlFor="password">
          PASSWORD
        </label>
        <input
          type="password"
          value={password}
          onChange={this.onChangePassword}
          placeholder="Password"
          className="input-element"
          id="password"
        />
      </div>
    )
  }

  render() {
    const {showError, errorMsge} = this.state
    const jwtToken = Cookies.get('jwt_token')

    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    return (
      <div className="login-container">
        <div className="form-container">
          <form onSubmit={this.onSubmitLogin} className="form-div">
            <img
              className="website-logo"
              alt="website logo"
              src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
            />
            {this.renderUsername()}
            {this.renderPassword()}
            <div className="button-container">
              <button className="login-button" type="submit">
                Login
              </button>
            </div>
            {showError && <p className="error-message">*{errorMsge}</p>}
          </form>
        </div>
      </div>
    )
  }
}

export default Login
