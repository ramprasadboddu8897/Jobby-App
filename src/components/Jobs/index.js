import './index.css'
import Cookies from 'js-cookie'
import {Component} from 'react'
import {BsSearch} from 'react-icons/bs'

import Loader from 'react-loader-spinner'
import JobItem from '../JobItem'
import Header from '../Header'

// These are the lists used in the application. You can move them to any component needed.
const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULLTIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PARTTIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Jobs extends Component {
  state = {
    jobsList: '',
    profileDetails: '',
    apiProfileStatus: apiStatusConstants.initial,
    apiJobsStatus: apiStatusConstants.initial,
    employmentType: [],
    salaryRange: '',
    searchInput: '',
  }

  // API CALL
  componentDidMount() {
    // this.getJobsDetails()
    this.getProfileDetails()
    this.getJobsApiList()
  }

  // API CALL FOR PROFILE
  getProfileDetails = async () => {
    this.setState({apiProfileStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      const formatedData = {
        profileDetails: {
          name: data.profile_details.name,
          profileImageUrl: data.profile_details.profile_image_url,
          shortBio: data.profile_details.short_bio,
        },
      }
      this.setState({
        profileDetails: formatedData.profileDetails,
        apiProfileStatus: apiStatusConstants.success,
      })
    }
    if (response.status === 400) {
      this.setState({apiProfileStatus: apiStatusConstants.failure})
    }
  }

  // API CALL FOR JOBS
  getJobsApiList = async () => {
    this.setState({apiJobsStatus: apiStatusConstants.inProgress})
    const {employmentType, salaryRange, searchInput} = this.state

    const jwtToken = Cookies.get('jwt_token')

    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${[
      ...employmentType,
    ]}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, options)

    if (response.ok === true) {
      const data = await response.json()
      const formatedData = data.jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      this.setState({
        jobsList: formatedData,
        apiJobsStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiJobsStatus: apiStatusConstants.failure})
    }
  }

  // Render Profile Failure
  renderProfileFailure = () => {
    const onClickRetry = () => this.getProfileDetails()

    return (
      <div className="profile-failure-container">
        <button className="retry-button" onClick={onClickRetry} type="button">
          Retry
        </button>
      </div>
    )
  }

  // Render Profile
  renderProfile = () => {
    const {profileDetails} = this.state
    const {profileImageUrl, name, shortBio} = profileDetails

    return (
      <div className="card-container">
        <img className="profile" alt="profile" src={profileImageUrl} />
        <h1 className="profile-name">{name}</h1>
        <p className="profile-bio">{shortBio}</p>
      </div>
    )
  }

  // Render Loader
  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  // Render Profile Main Container
  renderProfileCard = () => {
    const {apiProfileStatus} = this.state

    switch (apiProfileStatus) {
      case apiStatusConstants.success:
        return this.renderProfile()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.failure:
        return this.renderProfileFailure()
      default:
        return null
    }
  }

  // removing Event
  upDateState = inputElement => {
    const {employmentType} = this.state
    const filterEmployment = employmentType.filter(
      eachType => eachType !== inputElement,
    )
    this.setState({employmentType: filterEmployment})
  }

  // adding Event
  addingEvent = InputEmployment => {
    const {employmentType} = this.state
    if (employmentType.includes(InputEmployment)) {
      return this.upDateState(InputEmployment)
    }
    return InputEmployment
  }

  // On Change Events
  onChangeSalary = event =>
    this.setState({salaryRange: event.target.id}, this.getJobsApiList)

  onChangeEmployment = event =>
    this.setState(
      prevState => ({
        employmentType: [
          ...prevState.employmentType,
          this.addingEvent(event.target.id),
        ],
      }),
      this.getJobsApiList,
    )

  onChangeSearchInput = event =>
    this.setState({searchInput: event.target.value}, this.getJobsApiList)

  // Render Filter Section
  renderFilterSection = () => {
    const {salaryRange, employmentType} = this.state

    return (
      <div className="filter-section">
        <hr className="hori-line" />
        <h1 className="sort-heading">Type of Employment</h1>
        <ul className="sort-list">
          {employmentTypesList.map(eachItem => (
            <li key={eachItem.employmentTypeId} className="list-items">
              <input
                onChange={this.onChangeEmployment}
                value={employmentType}
                id={eachItem.employmentTypeId}
                className="sort-input-element"
                type="checkbox"
              />
              <label
                className="sort-labels"
                htmlFor={eachItem.employmentTypeId}
              >
                {eachItem.label}
              </label>
            </li>
          ))}
        </ul>
        <hr className="hori-line" />
        <h1 className="sort-heading">Salary Range</h1>
        <ul className="sort-list">
          {salaryRangesList.map(eachItem => (
            <li key={eachItem.salaryRangeId} className="list-items">
              <input
                onChange={this.onChangeSalary}
                value={salaryRange}
                id={eachItem.salaryRangeId}
                name="salary"
                className="sort-input-element"
                type="radio"
              />
              <label className="sort-labels" htmlFor={eachItem.salaryRangeId}>
                {eachItem.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Render No Job Section
  renderNoJobSection = () => (
    <div className="job-failure-section">
      <img
        alt="no jobs"
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png "
      />
      <h1 className="failure-heading">No Jobs Found</h1>
      <p className="failure-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  // Render Job Failure Section
  renderJobFailureSection = () => {
    const onClickRetry = () => this.getJobsApiList()

    return (
      <div className="job-failure-section">
        <img
          alt="failure view"
          src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        />
        <h1 className="failure-heading">Oops! Something Went Wrong</h1>
        <p className="failure-description">
          We cannot seem to find the page you are looking for.
        </p>
        <button onClick={onClickRetry} type="button" className="retry-button">
          Retry
        </button>
      </div>
    )
  }

  onEnterSearchButton = () => this.getJobsApiList()

  // Render Search Element
  renderSearchElement = () => {
    const {searchInput} = this.state
    return (
      <div className="jobs-list-section">
        <div className="search-container">
          <input
            value={searchInput}
            onChange={this.onChangeSearchInput}
            placeholder="Search"
            className="search-input"
            type="search"
          />
          <button
            onClick={this.onEnterSearchButton}
            className="search-button"
            type="button"
            data-testid="searchButton"
          >
            <BsSearch className="search-icon" />
          </button>
        </div>
      </div>
    )
  }

  // Render Jobs Section
  renderJobsSection = () => {
    const {jobsList} = this.state

    const noJobsFound = jobsList.length === 0
    return noJobsFound ? (
      this.renderNoJobSection()
    ) : (
      <ul className="jobs-container-list">
        {jobsList.map(eachItem => (
          <JobItem key={eachItem.id} jobData={eachItem} />
        ))}
      </ul>
    )
  }

  // Job Main Section
  renderJobsListSection = () => {
    const {apiJobsStatus} = this.state

    switch (apiJobsStatus) {
      case apiStatusConstants.success:
        return this.renderJobsSection()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.failure:
        return this.renderJobFailureSection()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="jobs-main-container">
        <Header />
        <div className="jobs-container">
          <div className="profile-card-container">
            {this.renderProfileCard()}
            {this.renderFilterSection()}
          </div>
          <div className="jobs-section-container">
            <div className="search-section">{this.renderSearchElement()}</div>
            {this.renderJobsListSection()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
