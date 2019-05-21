import React from 'react';
import Reviews from './Reviews.jsx';
import $ from 'jquery';
import styled from 'styled-components';
import RecentlyPosted from './RecentlyPosted.jsx';
import FilterComponent from './FilterComponent.jsx';

/* REVIEWS MODULE
** Purpose: the ReviewsModule is the starting point for 3 separate components
** 1. Filters: dynamically display available filters pulled from BE
** 2. Reviews: reviews based on selected filter values
** 3. Recent reviews: most recent 10 reviews based on selected date range
*/
class ReviewsModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [],          // List of all available filters
      activeFilters: {},    // Active filters and their selected options
      filterSearch: {},     // Filter object to send to the BE for query
      count: 0,             // Number of results matching filter
      reviews: [],          // Array of review objects given filter
      recentReviews: []     // Array of most recent reviews given filter
    };
    this.updateReviewState = this.updateReviewState.bind(this);
  }

  componentDidMount() {
    this.getReviews(this.state.activeFilters, this.updateReviewState);
    this.getFilters((err, data) => {
      if (err) { return console.error('Error getting filters'); }
      this.setState({
        filters: data
      });
    });
  }

  updateReviewState(data) {
    // Callback function to be invoked on received data (array of review objects)
    // Update count 
    // Update filtered reviews 
    // Update most recent reviews 
    // Update state for all the above

    let reviews = data.rows;
    let count = data.count;
    let recentReviews = reviews.slice().sort((a, b) => {
      return new Date(b.review_date) - new Date(a.review_date);
    }).slice(0, 10);
    this.setState({ reviews, recentReviews, count });
  }

  getReviews(options, callback) {
    $.ajax({
      url: 'http://localhost:3005/reviews',
      method: 'GET',
      data: {where: options},
      success: result => callback(result),
      error: () => console.error('Couldn\'t get reviews')
    });
  }

  getFilters(callback) {
    $.ajax({
      url: 'http://localhost:3005/reviews/filters',
      method: 'GET',
      success: (data) => callback(null, data), 
      error: (err) => console.error('Error getting filter', err)
    });
  }

  /* Set filters takes an event, a filter (e.g. language), and an option object with { optionId, optionName }
  ** optionId and optionName values are strings i they are valid, and empty objects if not, due to ORM/Sequelize recognizing empty objects as null
  ** If the updated filter has no restriction, e.g. it's an empty object, we delete the filter
  ** Else we update the filter with the new option.
  **
  ** Note, as have an activeFilters object and a filterSearch object
  ** activeFilters: filters (e.g. 'language') are keys, but values are objects with option ID and option display
  **  This is because filter 'Recommended' has values true/false, but display as 'Recommended' and 'Not recommended.
  ** filterSearch: this is the actual option object that is sent to an API. It contains the values to narrow the query by.
  */
  setFilters(e, filter, option) {
    let activeFilters = Object.assign(this.state.activeFilters);
    let filterSearch = Object.assign(this.state.filterSearch);

    if (typeof option.optionId === 'object' && Object.keys(option.optionId).length === 0) {
      delete activeFilters[filter];
      delete filterSearch[filter];
    } else {
      activeFilters[filter] = option;
      filterSearch[filter] = option.optionId;
    }
    this.setState({activeFilters, filterSearch});
    this.getReviews(filterSearch, this.updateReviewState);
  }

  render() {
    return (
      <ModuleContainer>
        <FilterComponent setFilters={this.setFilters.bind(this)} activeFilters={this.state.activeFilters} 
          filters={this.state.filters} count={this.state.count}/>
        <Reviews reviews={this.state.reviews}/>
        <RecentlyPosted reviews={this.state.recentReviews}/>
      </ModuleContainer>
    );
  }
}

const ModuleContainer = styled.div`
  background: #1a2738;
  font-family: Arial, Helvetica, sans-serif;
  max-width: 1300px;
`;

export default ReviewsModule;