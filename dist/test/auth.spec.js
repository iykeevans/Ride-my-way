'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _ngFaker = require('ng-faker');

var _ngFaker2 = _interopRequireDefault(_ngFaker);

var _app = require('./../app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_chaiHttp2.default);

describe('Test for auth endpoints for Ride-my-way ride API', function () {
  var firstName = _ngFaker2.default.name.firstName();
  var lastName = _ngFaker2.default.name.lastName();
  var email = (firstName + '.' + lastName + '@gmail.com').toLowerCase();

  var data = {
    name: firstName + ' ' + lastName,
    email: '' + email,
    password: firstName.toLowerCase() + 'Password'
  };

  describe('POST create new user', function () {
    it('should return an object with success with an object of created resources', function (done) {
      _chai2.default.request(_app2.default).post('/api/v1/auth/register').set('Accept', 'application/json').set('Content-Type', 'application/x-www-form-urlencoded').send(data).end(function (err, res) {
        (0, _chai.expect)(err).to.equal(null);
        (0, _chai.expect)(res.status).to.equal(201);
        (0, _chai.expect)(res.body.status).to.equal('success');
        (0, _chai.expect)(res.body.data).to.be.an('object');
        (0, _chai.expect)(res.body.data.photo).to.equal('avatar.png');
        done();
      });
    });
  });

  describe('POST log user in', function () {
    it('should return an object with success with an object containing auth token if auth is successfull', function (done) {
      _chai2.default.request(_app2.default).post('/api/v1/auth/login').set('Accept', 'application/json').set('Content-Type', 'application/x-www-form-urlencoded').send({
        email: 'nuchejud@gmail.com',
        password: 'mypassword'
      }).end(function (err, res) {
        (0, _chai.expect)(err).to.equal(null);
        (0, _chai.expect)(res.status).to.equal(200);
        (0, _chai.expect)(res.body.status).to.equal('success');
        (0, _chai.expect)(res.body.data).to.be.an('object');
        (0, _chai.expect)(res.body.data.isAuth).to.equal(true);
        done();
      });
    });
  });
});