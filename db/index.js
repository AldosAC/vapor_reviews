/* eslint-disable camelcase */
const Sequelize = require('sequelize');
const sequelize = new Sequelize('steam_reviews', 'root', null, {
  host: 'localhost',
  dialect: 'mysql'
});
const Review = require('./models/review.js')(sequelize);
const Comment = require('./models/comment.js')(sequelize);

const moment = require('moment');

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const getReviews = (options, callback) => {
  Review.findAndCountAll(options)
    .then(data => callback(null, data))
    .catch(err => callback(err));
};

const getLanguageFilter = (callback) => {
  Review.findAll({
    group: ['language'],
    attributes: ['language', [Sequelize.fn('COUNT', 'language'), 'count']]    
  })
    .then(data => {
      let languageArray = data.map(locale => {
        return {
          id: locale.language.toLowerCase(),
          displayName: locale.language,
          count: locale.dataValues.count
        };
      });
      callback(null, languageArray);
    })
    .catch(err => callback(err));
};

const getComments = (options, callback) => {
  Comment.findAll(options)
    .then(data => callback(null, data))
    .catch(err => callback(err));
};

const createComment = (options, callback) => {
  Comment.create(options)
    .then(data => callback(null, data))
    .catch(e => callback(e));
};

Review.sync({ force: false, logging: true })
  .then(() => {
    console.log('Review table synced');
  }).
  then(() => {
    return Comment.sync({ force: false, logging: true });
  })
  .then(() => {
    //Comment.hasOne(Review);
    console.log('Comment table synced');
  })
  .catch(e => console.error(e));

module.exports.getReviews = getReviews;
module.exports.getLanguageFilter = getLanguageFilter;
module.exports.Review = Review;
module.exports.Comment = Comment;
module.exports.getComments = getComments;
module.exports.createComment = createComment;

