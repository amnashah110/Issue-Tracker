const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    test('POST with every field', function (done) {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({
                issue_title: "Test",
                issue_text: "Testing for QA",
                created_by: "Me",
                assigned_to: "No One",
                status_text: "Good"
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                const issue = res.body;
                assert.propertyVal(issue, 'issue_title', "Test");
                assert.propertyVal(issue, 'issue_text', "Testing for QA");
                assert.propertyVal(issue, 'created_by', "Me");
                assert.propertyVal(issue, 'assigned_to', "No One");
                assert.propertyVal(issue, 'status_text', "Good");
                assert.propertyVal(issue, 'open', true);
                const now = new Date();
                const createdOn = new Date(issue.created_on);
                const updatedOn = new Date(issue.updated_on);
                const tolerance = 1000;
                assert.isTrue(Math.abs(now - createdOn) < tolerance, `Creation date should be within ${tolerance} ms`);
                assert.isTrue(Math.abs(now - updatedOn) < tolerance, `Update date should be within ${tolerance} ms`);
                done();
            });
    });
    test('POST with required field', function (done) {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({
                issue_title: "Test",
                issue_text: "Testing for QA",
                created_by: "Me",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                const issue = res.body;
                assert.propertyVal(issue, 'issue_title', "Test");
                assert.propertyVal(issue, 'issue_text', "Testing for QA");
                assert.propertyVal(issue, 'created_by', "Me");
                assert.propertyVal(issue, 'assigned_to', "");
                assert.propertyVal(issue, 'status_text', "");
                assert.propertyVal(issue, 'open', true);
                const now = new Date();
                const createdOn = new Date(issue.created_on);
                const updatedOn = new Date(issue.updated_on);
                const tolerance = 1000;
                assert.isTrue(Math.abs(now - createdOn) < tolerance, `Creation date should be within ${tolerance} ms`);
                assert.isTrue(Math.abs(now - updatedOn) < tolerance, `Update date should be within ${tolerance} ms`);
                done();
            });
    });
    test('POST with missing required fields', function (done) {
        chai.request(server)
            .post('/api/issues/apitest')
            .send({

            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'required field(s) missing' });
                done();
            });
    });
    test('GET issues with project name', function (done) {
        chai.request(server)
          .get('/api/issues/apitest')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            const issue = res.body;
            assert.isArray(res.body, 'response should be an array');
            res.body.forEach(issue => {
                assert.propertyVal(issue, 'project_name', 'apitest');
            });
            done();
          });
      });
      test('GET issues with project name and one filter', function (done) {
        chai.request(server)
          .get('/api/issues/apitest?open=false')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            const issue = res.body;
            assert.isArray(res.body, 'response should be an array');
            res.body.forEach(issue => {
                assert.propertyVal(issue, 'open', false);
            });
            done();
          });
      });
      test('GET issues with project name and multiple filters', function (done) {
        chai.request(server)
          .get('/api/issues/apitest?open=false&issue_title=HELLO')
          .end(function (err, res) {
            assert.equal(res.status, 200);
            const issue = res.body;
            assert.isArray(res.body, 'response should be an array');
            res.body.forEach(issue => {
                assert.propertyVal(issue, 'open', false);
                assert.propertyVal(issue, 'issue_title', 'HELLO');
            });
            done();
          });
      });
      test('PUT with one field', function (done) {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '66b3b4e80d3d92a706c4e629',
                issue_text: "BYE"
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully updated', _id: '66b3b4e80d3d92a706c4e629' });
                done();
            });
    });
    test('PUT with multiple fields', function (done) {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '66b3b4e80d3d92a706c4e629',
                issue_text: "BYE",
                open: false
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully updated', _id: '66b3b4e80d3d92a706c4e629' });
                done();
            });
    });
    test('PUT with missing id', function (done) {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                issue_text: "BYE",
                open: false
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'missing _id' });
                done();
            });
    });
    test('PUT with no fields to update', function (done) {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '66b3b4e80d3d92a706c4e629'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: '66b3b4e80d3d92a706c4e629' });
                done();
            });
    });
    test('PUT with invalid id', function (done) {
        chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '66b3b4a8f3d',
                issue_text: "BYE",
                open: false
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not update', _id: '66b3b4a8f3d' });
                done();
            });
    });
    test('DELETE an issue', function (done) {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({
                _id: '66b3b5c5f48f2aa173dbce62'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { result: 'successfully deleted', _id: '66b3b5c5f48f2aa173dbce62' });
                done();
            });
    });
    test('DELETE an issue with invalid id', function (done) {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({
                _id: '66b3b'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'could not delete', _id: '66b3b' });
                done();
            });
    });
    test('DELETE an issue with missing id', function (done) {
        chai.request(server)
            .delete('/api/issues/apitest')
            .send({
                
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'missing _id' });
                done();
            });
    });
});

